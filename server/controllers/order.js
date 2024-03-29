import path from 'path';
import async from 'async';
import Order from '../models/order';
import User from '../models/user';
import moment from 'moment';
import { sendNotification } from '../helpers/sendNotification'
import {transport, EmailTemplate, templatesDir} from '../helpers/emailService';
import messagingService from '../helpers/phoneMessagingService';
import config from '../../config/env/index'

function orderSubmit(req, res) {
    /*
     *  do 4 things
     *   1. create a new mongodb entry for order
     *   2. send an to the provider asking him/her to confirm that order has been submitted
     *   3. Send a notification to provider
     *   4. return back the order summary with the current status (waiting for provider confirmation)
     */
    async.waterfall([
        function saveOrderInDb(cb) {
            // assume email has been sent to the provider
            req.body.mailSentToProvider = true;
            let newOrder = new Order(req.body);
            newOrder.save(function(err, savedOrder) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, savedOrder);
                }
            })
        },
        function sendEmailToProvider(savedOrder, cb) {
            let template = new EmailTemplate(path.join(templatesDir, 'order-submit-provider'));
            req.body.orderActionUrl = config.homeUrl + "order/" + savedOrder._id + "/" + savedOrder._creator + "/confirm/order-action";
            req.body.orderId = savedOrder._id
            for (var key in req.body.itemsCheckedOut) {
                if (req.body.itemsCheckedOut.hasOwnProperty(key)) {
                    req.body.itemsCheckedOut[key].orderDate = moment.utc(req.body.itemsCheckedOut[key].orderDate).format("ddd, MMM Do");
                    // overwrite price by displayPrice
                    let displayPrice = req.body.itemsCheckedOut[key].displayPrice;
                    req.body.itemsCheckedOut[key].price = (displayPrice && displayPrice != 'undefined') ? displayPrice : '$ ' + req.body.itemsCheckedOut[key].price;
                }
            }
            template.render(req.body, function(err, results) {
                if (results && results.html) {
                    let mailOptions = {
                        from: '"Spoon&Spanner 👥"<orders.noreply@spoonandspanner.com>', // sender address
                        // to: req.body.customerEmailId + ', ' + req.body.providerEmailId, // list of receivers
                        to: req.body.providerEmailId,
                        subject: 'You received an order from ' + req.body.customerName, // Subject line
                        html: results.html, // html body
                    };
                    transport.sendMail(mailOptions, function(error, info) {
                        cb(error, savedOrder);
                    });
                } else cb(err, savedOrder);
            });
        },
        function sendNotificationToProvider(savedOrder, cb) {
            User.findById(savedOrder._providerId, function(err, user) {
                if (user) {
                    let devices = user.devices;
                    devices = devices || [];
                    // register in the list of devices
                    if (devices.length > 0) {
                        // send push notification
                        sendNotification('New order from ' + savedOrder.customerName, devices);
                    }
                    let phone = user.phone;
                    if(phone != ''){
                        messagingService(phone,'You have a '+savedOrder.orderType+' order from ' + savedOrder.customerName + '. Please check email and take action. Spoonandspanner' , function(){});
                    }
                }
            })
            // just initiate the code above and forget
            cb(null, savedOrder);
        },
        function incrementProviderOrderCount(savedOrder, cb) {
            User.findById(savedOrder._providerId)
                .exec(function(err, user) {
                    if (user) {
                        user.ordersReceived = user.ordersReceived + 1;
                        user.save(); // hopefully it should be saved
                    }

                    cb(err, savedOrder);
                })
        }
    ], function(err, savedOrder) {
        if (err) {
            return res.json({ error: err });
        } else {
            res.json({
                message: savedOrder
            });
        }
    });
}

function orderConfirmCustomer(req, res) {
    const confirmedOrder = req.body;
    async.waterfall([
            function findOrder(cb) {
                Order.findById(confirmedOrder._id, function(err, order) {
                    if (order) {
                        if (order.mailSentToCustomer) {
                            cb({ message: "email already sent" }, null);
                        } else {
                            // let overwite the props that provider can overwrite
                            order.providerAddress = confirmedOrder.providerAddress;
                            order.providerAddtnlInfo = confirmedOrder.providerAddtnlInfo;
                            order.updatedByProvider = confirmedOrder.updatedByProvider;
                            //done
                            order.status = 1;
                            order.mailSentToCustomer = true;
                            order.save(function(err, savedOrder) {
                                cb(null, savedOrder);
                            });
                        }
                    } else cb(err || { message: "order id " + order_id + "  not found" });

                });
            },
            // enable review eligible for this item
            function enableReviewForCustomer(savedOrder, cb) {
                User.findById(savedOrder._creator)
                    .exec(function(err, user) {
                        let foodItemIds = [];
                        for (let key in savedOrder.itemsCheckedOut) {
                            if (savedOrder.itemsCheckedOut.hasOwnProperty(key)) {
                                let foodItem = savedOrder.itemsCheckedOut[key];
                                foodItemIds.push(key);
                            }
                        }
                        user.reviewEligibleFoodItems = user.reviewEligibleFoodItems || [];
                        for (let i = 0; i < foodItemIds.length; i++) {
                            if (user.reviewEligibleFoodItems.indexOf(foodItemIds[i]) === -1) {
                                user.reviewEligibleFoodItems.push(foodItemIds[i]);
                            }
                        }
                        user.save(function(err, savedUser) {
                            cb(err, savedOrder);
                        })
                    })
            },
            function sendEmailToCustomer(savedOrder, cb) {
                let resolvedSavedOrder = JSON.parse(JSON.stringify(savedOrder));
                resolvedSavedOrder.orderId = savedOrder._id
                resolvedSavedOrder.providerAddtnlInfo = savedOrder.providerAddtnlInfo || '';
                for (var key in resolvedSavedOrder.itemsCheckedOut) {
                    if (resolvedSavedOrder.itemsCheckedOut.hasOwnProperty(key)) {
                        resolvedSavedOrder.itemsCheckedOut[key].orderDate = moment.utc(resolvedSavedOrder.itemsCheckedOut[key].orderDate).format("ddd, MMM Do")
                        // overwrite price by displayPrice
                        let displayPrice = resolvedSavedOrder.itemsCheckedOut[key].displayPrice;
                        resolvedSavedOrder.itemsCheckedOut[key].price = (displayPrice && displayPrice != 'undefined') ? displayPrice : '$ ' + resolvedSavedOrder.itemsCheckedOut[key].price;
                    }
                }
                let template = new EmailTemplate(path.join(templatesDir, 'order-confirmed-customer'));
                template.render(resolvedSavedOrder, function(err, results) {
                    if (results && results.html) {
                        let mailOptions = {
                            from: '"Spoon&Spanner 👥"<orders.noreply@spoonandspanner.com>', // sender address
                            to: resolvedSavedOrder.customerEmailId,
                            subject: 'Awwright! ' + resolvedSavedOrder.providerName + ' approved your order', // Subject line
                            html: results.html, // html body
                        };
                        transport.sendMail(mailOptions, function(error, info) {
                            cb(error, savedOrder);
                        });
                    } else cb(err);
                });
            },
            function sendNotificationToCustomer(savedOrder, cb) {
                User.findById(savedOrder._creator, function(err, user) {
                    if (user) {
                        let devices = user.devices;
                        devices = devices || [];
                        // register in the list of devices
                        if (devices.length > 0) {
                            sendNotification('Confirmed! order with ' + savedOrder.providerName, devices);
                        }
                    }
                })
                cb(null, savedOrder);
            },
            function incrementProviderConfimCount(savedOrder, cb) {
                User.findById(savedOrder._providerId).exec(function(err, user) {
                    if (user) {
                        async.waterfall([function incrementProviderConfirmCount(callback) {
                            user.ordersConfirmed = user.ordersConfirmed + 1;
                            callback(null, user);
                        }], function() {
                            user.save();
                            cb(null, savedOrder);
                        });
                    } else {
                        cb(err, savedOrder);
                    };
                });
            }
        ],
        function(err, savedOrder) {
            if (err) {
                return res.json({ error: err });
            } else {
                res.json({
                    message: savedOrder
                });
            }
        });

}

function orderCancelCustomer(req, res) {
    const cancelledOrder = req.body;
    async.waterfall([
            function findOrder(cb) {
                Order.findById(cancelledOrder._id, function(err, order) {
                    if (order) {
                        if (order.mailSentToCustomer) {
                            cb({ message: "email already sent" }, null);
                        } else {
                            // let overwite the props that provider can overwrite
                            order.providerAddress = cancelledOrder.providerAddress;
                            order.providerAddtnlInfo = cancelledOrder.providerAddtnlInfo;
                            order.updatedByProvider = cancelledOrder.updatedByProvider;
                            order.cancelReason = cancelledOrder.cancelReason;

                            order.mailSentToCustomer = true;
                            order.status = 0;

                            const CANCEL_REASONS = [
                                { value: 1, label: 'Sold out' },
                                { value: 2, label: 'User pickup/delivery time is not acceptable' },
                                { value: 3, label: 'User address is out of delivery area' },
                                { value: 4, label: 'Unknown/incomplete user address for delivery' },
                                { value: 5, label: 'Questions about customer authenticity' },
                                { value: 6, label: 'Other' }
                            ];
                            if (cancelledOrder.cancelReason === 6) {
                                order.cancelText = cancelledOrder.cancelText;
                            } else {
                                CANCEL_REASONS.forEach(function(cancelReason) {
                                    if (cancelReason.value === order.cancelReason) {
                                        order.cancelText = cancelReason.label;
                                    }
                                })
                            }
                            order.save(function(err, savedOrder) {
                                cb(null, savedOrder);
                            });
                        }
                    } else cb(err || { message: "order id  not found" });

                });
            },
            function sendEmailToCustomer(savedOrder, cb) {
                let resolvedSavedOrder = JSON.parse(JSON.stringify(savedOrder));
                resolvedSavedOrder.orderId = savedOrder._id
                resolvedSavedOrder.providerAddtnlInfo = savedOrder.providerAddtnlInfo || '';

                let template = new EmailTemplate(path.join(templatesDir, 'order-cancel-customer'));
                for (var key in resolvedSavedOrder.itemsCheckedOut) {
                    if (resolvedSavedOrder.itemsCheckedOut.hasOwnProperty(key)) {
                        resolvedSavedOrder.itemsCheckedOut[key].orderDate = moment.utc(resolvedSavedOrder.itemsCheckedOut[key].orderDate).format("ddd, MMM Do");
                        // overwrite price by displayPrice
                        let displayPrice = resolvedSavedOrder.itemsCheckedOut[key].displayPrice;
                        resolvedSavedOrder.itemsCheckedOut[key].price = (displayPrice && displayPrice != 'undefined') ? displayPrice : '$ ' + resolvedSavedOrder.itemsCheckedOut[key].price;
                    }
                }
                template.render(resolvedSavedOrder, function(err, results) {
                    if (err) {
                        console.log(err)
                    }
                    if (results && results.html) {
                        let mailOptions = {
                            from: '"Spoon&Spanner 👥"<orders.noreply@spoonandspanner.com>', // sender address
                            to: resolvedSavedOrder.customerEmailId,
                            subject: 'Oops! ' + resolvedSavedOrder.providerName + ' cancelled your order', // Subject line
                            html: results.html, // html body
                        };
                        transport.sendMail(mailOptions, function(error, info) {
                            cb(error, savedOrder);
                        });
                    } else cb(err);
                });
            },
            function sendNotificationToCustomer(savedOrder, cb) {
                User.findById(savedOrder._creator, function(err, user) {
                    if (user) {
                        let devices = user.devices;
                        devices = devices || [];
                        // register in the list of devices
                        if (devices.length > 0) {
                            sendNotification('Cancelled! order with ' + savedOrder.providerName, devices);
                        }
                    }
                })
                cb(null, savedOrder);
            },
            function incrementProviderCancelCount(savedOrder, cb) {
                User.findById(savedOrder._providerId)
                    .exec(function(err, user) {
                        if (user) {
                            user.ordersCancelled = user.ordersCancelled + 1;
                            user.save(); // hopefully it should be saved
                        }

                        cb(err, savedOrder);
                    })
            }
        ],
        function(err, savedOrder) {
            if (err) {
                return res.json({ error: err });
            } else {
                res.json({
                    message: savedOrder
                });
            }
        });

}


function get(req, res) {
    const userId = req.param('userId');
    const role = req.param('role');
    if (role === 'customer') {
        Order.find({ _creator: userId }, {}, { sort: { 'created_at': -1 } }, function(err, orders) {
            res.json(orders);
        })
    } else if (role === 'provider') {
        Order.find({ _providerId: userId }, {}, { sort: { 'created_at': -1 } }, function(err, orders) {
            res.json(orders);
        })
    }

}

function load(req, res) {
    const orderId = req.param('orderId');
    Order.findById(orderId, function(err, order) {
        res.json(order);
    })
}


export default { orderSubmit, orderConfirmCustomer, get, orderCancelCustomer, load }
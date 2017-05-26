import path from 'path';
import async from 'async';
import nodemailer from 'nodemailer';
import email_templates from 'email-templates';
import sesTransport from 'nodemailer-ses-transport';
import Order from '../models/order';
import User from '../models/user';
import moment from 'moment';

const transport = nodemailer.createTransport(sesTransport({
    "accessKeyId": "AKIAISGDIT6QWWGXAEPA",
    "secretAccessKey": "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",
    "region": 'us-west-2',
    "rateLimit": 5 // do not send more than 5 messages in a second 
}));

// let transport = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'autoenthu@gmail.com',
//         pass: 'XXXXX'
//     }
// });

let EmailTemplate = email_templates.EmailTemplate;
const templatesDir = path.resolve(__dirname, '../../');


function orderSubmit(req, res) {
    /*
     *  do 3 things
     *   1. create a new mongodb entry for order
     *   2. send an to the provider asking him/her to confirm that order has been submitted
     *   3. return back the order summary with the current status (waiting for provider confirmation)
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
            req.body.orderActionUrl = "http://sample-env-2.brv2yyskaw.us-west-2.elasticbeanstalk.com/order/" + savedOrder._id + "/" + savedOrder._creator + "/confirm/order-action";
            req.body.orderId = savedOrder._id
            for (var key in req.body.itemsCheckedOut) {
                if (req.body.itemsCheckedOut.hasOwnProperty(key)) {
                    req.body.itemsCheckedOut[key].orderDate = moment(req.body.itemsCheckedOut[key].orderDate).format("ddd, MMM Do")
                }
            }
            template.render(req.body, function(err, results) {
                if (results && results.html) {
                    let mailOptions = {
                        from: '"fillurtummy 👥"<autoenthu@gmail.com>', // sender address
                        // to: req.body.customerEmailId + ', ' + req.body.providerEmailId, // list of receivers
                        to: req.body.providerEmailId,
                        subject: 'You reveived an order', // Subject line
                        html: results.html, // html body
                    };
                    transport.sendMail(mailOptions, function(error, info) {
                        cb(error, savedOrder);
                    });
                } else cb(err);
            });
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
                let template = new EmailTemplate(path.join(templatesDir, 'order-confirmed-customer'));
                template.render(resolvedSavedOrder, function(err, results) {
                    if (results && results.html) {
                        let mailOptions = {
                            from: '"fillurtummy 👥"<autoenthu@gmail.com>', // sender address
                            to: resolvedSavedOrder.customerEmailId,
                            subject: 'Your confirmed order', // Subject line
                            html: results.html, // html body
                        };
                        transport.sendMail(mailOptions, function(error, info) {
                            cb(error, savedOrder);
                        });
                    } else cb(err);
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
    const { orderId } = req.body;
    async.waterfall([
            function findOrder(cb) {
                Order.findById(orderId, function(err, order) {
                    if (order) {
                        if (order.mailSentToCustomer) {
                            cb({ message: "email already sent" }, null);
                        } else {
                            order.mailSentToCustomer = true;
                            order.status = 0;
                            order.save(function(err, savedOrder) {
                                cb(null, savedOrder);
                            });
                        }
                    } else cb(err || { message: "order id " + orderId + "  not found" });

                });
            },
            function sendEmailToCustomer(savedOrder, cb) {
                let resolvedSavedOrder = JSON.parse(JSON.stringify(savedOrder));
                resolvedSavedOrder.orderType = 'delivery'; // hardcoded for now
                let template = new EmailTemplate(path.join(templatesDir, 'order-cancel-customer'));
                template.render(resolvedSavedOrder, function(err, results) {
                    if (results && results.html) {
                        let mailOptions = {
                            from: '"fillurtummy 👥"<autoenthu@gmail.com>', // sender address
                            to: resolvedSavedOrder.customerEmailId,
                            subject: 'Order cancelled!', // Subject line
                            html: results.html, // html body
                        };
                        transport.sendMail(mailOptions, function(error, info) {
                            cb(error, savedOrder);
                        });
                    } else cb(err);
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


function get(req, res) {
    const userId = req.param('userId');
    const role = req.param('role');
    if (role === 'customer') {
        Order.find({ _creator: userId }, {}, { sort: { 'created_at': -1 } }, function(err, orders) {
            res.json(orders);
        })
    } else if (role === 'provider') {
        Order.find({ _providerId: userId }, function(err, orders) {
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

import path from 'path'
import User from '../models/user';
import async from 'async';
import messagingService from './../helpers/phoneMessagingService';
import {transport, EmailTemplate, templatesDir} from './../helpers/emailService';

function messageProvider(req, res, next) {
    const reqParams = req.body;
    let template = new EmailTemplate(path.join(templatesDir, 'provider-message'));
    template.render(reqParams, function(err, results) {
        if (results && results.html) {
            let mailOptions = {
                from: '"Spoon&Spanner 👥"<orders.noreply@spoonandspanner.com>', // sender address
                to: reqParams.providerEmail,
                subject: 'You have a message from ' + reqParams.customerName, // Subject line
                html: results.html, // html body
            };
            transport.sendMail(mailOptions, function(error, info) {

            });
        }
        res.send({ status: 'ok' })
    });
}


function sendAuthCodeToProvider(req, res, next) {
    let loggedInUser = req.user;
    let phone = req.body.phone;
    phone = phone.replace(/\D/g,'');
    async.waterfall([
        function sendAuthCode(cb) {
            var codeGen = Math.floor(1000 + Math.random() * 9000);
            cb(null, codeGen);
        },
        function saveItInDB(codeGen, cb) {
            User.findById(loggedInUser, function(err, user) {
                if (!user) {
                    cb('ENOTFOUND', null);
                } else {
                    user.phoneAuthCode = codeGen;
                    user.save(function(err) {
                        cb(err, codeGen);
                    })
                }
            })
        },
        function sendSmsToUser(codeGen, cb) {
            messagingService(phone, 'Hello from Spoonsnaspanner. Your authorization code is ' + codeGen, cb);
        }
    ], function(err) {
        if (err) {
            res.send({ status: err });
        } else {
            res.send({ status: 'ok' });
        }
    });
}

function verifyAuthCode(req, res, next) {
    const loggedInUser = req.user;
    let {code, phone} = req.body;
    User.findById(loggedInUser, function(err, user) {
        if (!user) {
            res.send({status:'ENOTFOUND'});
        } else {
            if(user.phoneAuthCode === code){
                user.phone = phone;
                user.save();
                res.send({status:'ok'});
            }else res.send({status:'fail'});
        }
    })
}

export default { messageProvider, sendAuthCodeToProvider, verifyAuthCode }
import path from 'path';
import nodemailer from 'nodemailer';
import email_templates from 'email-templates';
import smtpTransport from 'nodemailer-smtp-transport';
import sesTransport from 'nodemailer-ses-transport';
import config from '../../config/env/index'
import User from '../models/user';
import async from 'async';
import * as plivo from 'plivo';

const ENV = config.env;

const p = plivo.RestAPI({
    authId: 'MANMYXNGZIMZFMNWEXMG',
    authToken: 'OGE5ZjNkMzJlZWUxY2Q3NWNhZTAxMTQ1ZGI4NjM1'
});

const transport = (ENV === 'production') ?
    nodemailer.createTransport(smtpTransport({
        host: "email-smtp.us-west-2.amazonaws.com", // Amazon email SMTP hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth: {
            user: "AKIAJ32VGSZIGP2KL4WA", // Use from Amazon Credentials
            pass: "Aq5LjDkOL8dAGukDDzK6AA60J+LVzamz2vP7wLa30HNE" // Use from Amazon Credentials
        }
    })) :
    nodemailer.createTransport(sesTransport({
        "accessKeyId": config.ACCESS_KEY_ID,
        "secretAccessKey": config.SECRET_ACCESS_KEY,
        "region": 'us-west-2',
        "rateLimit": 5 // do not send more than 5 messages in a second 
    }));

let EmailTemplate = email_templates.EmailTemplate;
const templatesDir = path.resolve(__dirname, '../../');

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
            var params = {
                'src': '19253171387 ', // Sender's phone number with country code
                'dst': phone, // Receiver's phone Number with country code
                'text': 'Your authorization code is ' + codeGen
            };
            p.send_message(params, function(status, response) {
                var uuid = response['message_uuid'];
                var params1 = { 'record_id': uuid };
                p.get_message(params1, function(status, response1) {
                    cb(null);
                });
            });
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
import nodemailer from 'nodemailer';
import email_templates from 'email-templates';
import path from 'path';
import smtpTransport from 'nodemailer-smtp-transport';
import sesTransport from 'nodemailer-ses-transport';
import config from '../../config/env/index'

const ENV = config.env;
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

export default {transport, EmailTemplate, templatesDir};
import path from 'path';
import async from 'async';
import nodemailer from 'nodemailer';
import email_templates from 'email-templates';
import sesTransport from 'nodemailer-ses-transport';


let EmailTemplate = email_templates.EmailTemplate;
let templatesDir = path.resolve(__dirname, '../../');
let template = new EmailTemplate(path.join(templatesDir, 'order-submit'));

function orderSubmit(req, res) {
    // let transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: 'autoenthu@gmail.com',
    //         pass: 'tennisenthu123'
    //     }
    // });
    let transport = nodemailer.createTransport(sesTransport({
        "accessKeyId": "AKIAISGDIT6QWWGXAEPA",
        "secretAccessKey": "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",
        "region":'us-west-2',
        "rateLimit": 5 // do not send more than 5 messages in a second 
    }));

    template.render(req.body, function(err, results) {
        let mailOptions = {
            from: '"fillurtummy 👥"<autoenthu@gmail.com>', // sender address
            to: 'autoenthu@gmail.com', // list of receivers
            subject: 'Your order', // Subject line
            html: results.html, // html body
        };

        transport.sendMail(mailOptions, function(error, info) {
            if (error) {
                return res.json({ error: "there was an error " + error });
            } else {
                res.json({
                    message: info.response
                });
            }
        });
    });
}
export default { orderSubmit }

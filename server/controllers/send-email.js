import async from 'async';
import nodemailer from 'nodemailer';

function orderSubmit(req, res) {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'autoenthu@gmail.com',
            pass: 'tennisenthu123'
        }
    });
    let htmlBody=['<table style="width:100%;padding:6px;background:#ffffff;border:1px solid #d9dbe5;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
            '<tbody>',
            '<tr>',
                '<td style="padding:0">',
                    '<table style="width:100%;background:#858a8d;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
                        '<tbody>',
                        '<tr>',
                            '<td style="padding:3px 0 3px 6px;color:#ffffff;font-size:15px;font-weight:bold;text-transform:uppercase">Delivery <span class="il">order</span></td>',
                            '<td style="padding:3px 6px 3px 0;color:#dfe0e1;font-size:12px;text-align:right">18538-8511</td>',
                        '</tr>',
                        '</tbody>',
                    '</table>',
                '</td>',
            '</tr>',
            '<tr>',
                '<td style="padding:0">',
                    '<table style="width:100%;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
                        '<tbody>',
                        '<tr>',
                            '<td style="padding:20px 0 10px;color:#686b6e;font-size:12px;border-bottom:1px solid #d9dbe5">Scheduled for</td>',
                            '<td style="padding:20px 0 10px;color:#2b2c2f;font-size:13px;text-align:right;border-bottom:1px solid #d9dbe5">ASAP</td>',
                        '</tr>',
                        '</tbody>',
                    '</table>',
               '</td>',
            '</tr>',
            '<tr>',
                '<td style="padding:0">',
                    '<table style="width:100%;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
                       '<tbody>',
                        '<tr>',
                            '<td style="padding:10px 0;color:#686b6e;font-size:12px;border-bottom:1px solid #d9dbe5">Est. Delivery time</td>',
                            '<td style="padding:10px 0;color:#2b2c2f;font-size:13px;text-align:right;border-bottom:1px solid #d9dbe5">45-60 min</td>',
                        '</tr>',
                        '</tbody>',
                    '</table>',
                '</td>',
            '</tr>',
            '<tr>',
                '<td style="padding:0">',
                    '<table style="width:100%;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
                        '<tbody>',
                        '<tr>',
                            '<td style="padding:10px 0;color:#686b6e;font-size:12px;border-bottom:1px solid #d9dbe5">From</td>',
                            '<td style="padding:10px 0;color:#2b2c2f;font-size:13px;text-align:right;border-bottom:1px solid #d9dbe5">',
                            	'A Town Pizza',
                            '</td>',
                        '</tr>',
                        '</tbody>',
                    '</table>',
                '</td>',
            '</tr>',
            '<tr style="background:#858a8d">',
                '<td colspan="2" style="padding:3px 6px;color:#ffffff;font-size:15px;font-weight:bold"><span class="il">ORDER</span> INFO</td>',
            '</tr>',
            '<tr>',
                '<td colspan="2" style="padding:0">',
                    '<table style="width:100%;font-size:13px;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
                        '<tbody>',
                        '<tr style="color:#858a8f;font-size:10px;font-weight:bold">',
                            '<th colspan="2" style="padding:10px 0 0;text-align:left">Item</th>',
                            '<th style="width:25px;padding:10px 0 0;text-align:center">Qty</th>',
                            '<th style="width:40px;padding:10px 0 0;text-align:right">Price</th>',
                        '</tr>',
                            '<tr>',
                                '<td style="width:63px;padding:10px 8px 10px 0;border-bottom:1px dotted #d9dbe5">',
                                    '<p style="width:55px;height:55px;max-height:55px;min-height:55px;margin:0;border:1px solid #b8bdc5;overflow:hidden">',
                                        '<img src="https://ci3.googleusercontent.com/proxy/dT1vZTMQXaKz8imW6hnAuVYhvNgp7bkH1kEUWJN5Ylot0TDkiEFucTQcin2mO_cQBKiaTChaRKHdGrMcQf1akOOAVOdN_ReAI4wkBBp55qKXBR75cBJF7YBUn7tWSeIHKbTdK_NEYLrTpbHNGujLGzlXUl3D=s0-d-e1-ft#http://eat24hours.com/yelp_images/s3-media3.fl.yelpcdn.com/bphoto/4QQUznlk1Fk6ILFnWATQfA/ms.jpg" height="55" width="55" style="height:55px;width:55px" class="CToWUd">',
                                    '</p>',
                                '</td>',
                                '<td style="padding:10px 0;text-align:left;border-bottom:1px dotted #d9dbe5;vertical-align:top">',
                                '<b style="color:#2b2c2f;font-size:15px">Garlic Chicken Pizza (18" Large)</b>',
                                '<p style="margin:10px 0 0;color:#9b9e9f"><b>Choice of Crust</b>:  Regular<br><b>Choice of Sauce</b>:  Pizza</p>',
                                '</td>',
                                '<td style="padding:10px 0 10px 7px;color:#60636a;text-align:center;border-bottom:1px dotted #d9dbe5;vertical-align:top">2</td>',
                                '<td style="padding:10px 0 10px 7px;color:#60636a;text-align:right;border-bottom:1px dotted #d9dbe5;vertical-align:top">$24.99</td>',
                            '</tr>',
                            '<tr>',
                                '<td colspan="2" style="padding:10px 0;text-align:left;border-bottom:1px dotted #d9dbe5;vertical-align:top">',
                                '<b style="color:#2b2c2f;font-size:15px">Vegetarian Pizza (18" Large)</b>',
                                '<p style="margin:10px 0 0;color:#9b9e9f"><b>Choice of Crust</b>:  Regular<br><b>Choice of Sauce</b>:  Pizza<br><b>Extra Toppings</b>:  Bell Pepper&nbsp;($1.00&nbsp;Extra),  Onion&nbsp;($1.00&nbsp;Extra)</p>',
                                '</td>',
                                '<td style="padding:10px 0 10px 7px;color:#60636a;text-align:center;border-bottom:1px dotted #d9dbe5;vertical-align:top">1</td>',
                                '<td style="padding:10px 0 10px 7px;color:#60636a;text-align:right;border-bottom:1px dotted #d9dbe5;vertical-align:top">$26.99</td>',
                            '</tr>',
                        '<tr>',
                            '<td colspan="4" style="padding:11px 0">',
                                '<table style="width:100%;color:#60636a;font-size:13px;text-align:right;border-spacing:0;font-family:Helvetica,Arial,sans-serif">',
                                    '<tbody>',
                                    '<tr>',
                                        '<td style="padding:4px 0">Subtotal</td>',
                                        '<td style="width:20%;padding:4px 0">$76.97</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td style="padding:4px 0">Tip</td>',
                                        '<td style="padding:4px 0">$12.85</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td style="padding:4px 0">Tax</td>',
                                        '<td style="padding:4px 0">$6.71</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td style="padding:4px 0">Delivery charge</td>',
                                        '<td style="padding:4px 0">$2.00</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td style="padding:4px 0">Paid with CREDIT CARD</td>',
                                        '<td style="padding:4px 0">$98.53</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td style="padding:4px 0">Total</td>',
                                        '<td style="padding:4px 0">$98.53</td>',
                                    '</tr>',
                                    '</tbody>',
                                '</table>',
                            '</td>',
                        '</tr>',
                        '</tbody>',
                    '</table>',
                '</td>',
            '</tr>',
            '</tbody>',
        '</table>'].join('');
    // setup e-mail data with unicode symbols
    let mailOptions = {
        from: '"fillurtummy 👥"<autoenthu@gmail.com>', // sender address
        to: 'autoenthu@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        html:  htmlBody// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return res.json({ error: "there was an error " + error });
        } else {
            res.json({
                message: info.response
            });
        }
    });
}

export default { orderSubmit }

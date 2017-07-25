import config from '../../config/env/index'
import * as https from 'https';

function sendNotification(message, playerIds) {
    let headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic "+ config.ONESIGNAL_REST_APIID
    };
    let data = {
        app_id: config.ONESIGNAL_APPID,
        contents: { "en": message },
        chrome_web_icon:'https://s3-us-west-1.amazonaws.com/prod-usr-food-imgs/logo.png',
        chrome_web_image:'https://s3-us-west-1.amazonaws.com/prod-usr-food-imgs/logo1024x1024.png',
        include_player_ids: playerIds,
        url:'/'
    };
    let options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };
    let req = https.request(options, function(res) {
        res.on('data', function(data) {
        });
    });
    req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });
    req.write(JSON.stringify(data));
    req.end();
};

export {sendNotification}
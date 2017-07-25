import User from '../models/user';
import { sendNotification } from '../helpers/sendNotification'

function register(req, res, next) {
    const deviceId = req.body.id;
    const loggedInUser = req.user;
    User.findById(loggedInUser, function(err, user) {
        if (user) {
            let devices = user.devices;
            devices = devices || [];
            // register in the list of devices
            if (deviceId && devices.indexOf(deviceId) === -1) {
                user.devices.push(deviceId);
            }
            user.save(function(err, savedUser) {
                if (err) {
                    res.status(500);
                    res.send({ err: err })
                } else {
                    // send a notification that you have been registered to send order updates or subscription messages
                    sendNotification('We will notify with order status etc.', [deviceId]);
                    res.json({ status: 'ok' });
                }
            })
        } else res.send("not able to find the user");
    })
}

function deregister(req, res, next) {
    const loggedInUser = req.user;
    User.findById(loggedInUser, function(err, user) {
        if (user) {
            let devices = [];
            // register in the list of devices
            user.devices = [];
            user.save(function(err, savedUser) {
                if (err) {
                    res.status(500);
                    res.send({ err: err })
                } else {
                    // send a notification that you have been registered to send order updates or subscription messages
                    res.json({ status: 'success' });
                }
            })
        } else res.send("not able to find the user");
    })
}

export default { register, deregister }

import jwt from 'jwt-simple';
import config from '../../config/env/index'
import moment from 'moment';

export default function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.header('Authorization').split(' ')[1];
    var payload = null;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    } catch (err) {
        return res.status(401).send({ message: err.message });
    }

    if (payload.exp <= moment().unix()) {
        return res.status(401).send({ message: 'Token has expired' });
    }
    req.user = payload.sub;
    next();
}

/*
* this middleware is used only in cases when we want to know 
* user is logged on for an api call which is insecure
*/
export function checkLogin(req, res, next) {
    // it should be a get call 
    let token = req.query.token;
    let payload;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    } catch (err) {
        next();
    }
    if (payload.exp <= moment().unix()) {
        next();
    }
    req.user = payload.sub;
    next();
}

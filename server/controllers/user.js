import User from '../models/user';
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../../config/env/index'


/**
 * Create JWT token
 */

function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(7, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET)
}

/**
 * Load user and append to req.
 */
function load(req, res) {
    const loggedInUser = req.user;
    User.findById(loggedInUser)
        .populate('foodItems')
        .exec(function(err,userAndFoodItems){
            res.json(userAndFoodItems)
        })
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
    console.log(req.params);
    User.findById(req.params.userId)
        .populate('foodItems')
        .exec(function(err,userAndFoodItems){
            res.json(userAndFoodItems)
        })
}

/**
 * Create new user
 * @property {string} req.body.name - The username of user.
 * @property {string} req.body.email - The email of user.
 * @returns {User}
 */
function create(req, res, next) {
    const keyForId = req.body.provider + 'UserID';
    User.findOne({
        email: req.body.email
    }, function(err, result) {
        if (result) {
            let alreadyPresentUser = result;
            let token = createJWT(alreadyPresentUser);
                res.send({ 
                        user: alreadyPresentUser, 
                        token: token 
                    });
        } else {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                provider: req.body.provider,
                img: (req.body.provider === 'fb') ? 'https://graph.facebook.com/' + req.body.userID + '/picture?type=small' : req.body.img,
                [keyForId]: req.body.userID
            });
            user.saveAsync()
                .then((savedUser) => {
                    let token = createJWT(savedUser);
                    res.send({ 
                            user: savedUser, 
                            token: token 
                        });
                })
                .error((e) => next(e));
        }
    })

}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
function update(req, res, next) {
    const user = req.user;
    user.username = req.body.username;
    user.mobileNumber = req.body.mobileNumber;

    user.saveAsync()
        .then((savedUser) => res.json(savedUser))
        .error((e) => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
    const { limit = 50, skip = 0 } = req.query;
    User.list({ limit, skip }).then((users) => res.json(users))
        .error((e) => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
    const user = req.user;
    user.removeAsync()
        .then((deletedUser) => res.json(deletedUser))
        .error((e) => next(e));
}

export default { load, get, create, update, list, remove };

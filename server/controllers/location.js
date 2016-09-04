import mongoose from 'mongoose'
import Zipcode from '../models/zipcode'
import User from '../models/user';
import request from 'request'
import config from '../../config/env/index'

/**
 * Load
 */

function getLatAndLong(place_id, cb) {
    request({
        method: 'get',
        uri: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs: {
            place_id: place_id,
            key: config.GOOGLE_GEOCODING
        }
    }, function(error, response, body) {
        if (error) {
            return cb(error);
        } else {
            let resolvedResponse = JSON.parse(body);
            // take the first google recommendation .. i trust you google dont fuck up
            let bestAddress = resolvedResponse.results[0];
            return cb(null, {
                latitude: bestAddress.geometry.location.lat,
                longitude: bestAddress.geometry.location.lng,
                place_id: place_id
            })
        }
    })
}

function zipcodeTypeAssist(req, res, next) {
    var regexp = new RegExp("^" + req.query.search, "i");
    var cities = Zipcode.find({ _id: regexp }, function(err, data) {
        res.json(data);
    })
}

function address(req, res, next) {
    let latitude = req.query.latitude;
    let longitude = req.query.longitude;

    /* 
     *   detect if the user is logged in...
     *   note that this detection logic coming from middleware
     *   if the user is logged in .. add this latitude to his most recent 
     *   address used which will be used as default when he comed in next time
     */

    request({
        method: 'get',
        uri: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs: {
            latlng: latitude + ',' + longitude,
            key: config.GOOGLE_GEOCODING
        }
    }, function(error, response, body) {
        let resolvedResponse = JSON.parse(body);
        // take the first google recommendation
        let formattedResponse = resolvedResponse.results[0];
        res.json({
            address: formattedResponse.formatted_address,
            place_id: formattedResponse.place_id
        })
    })
}

function addressTypeAssist(req, res, next) {
    let searchText = req.query.searchText;
    request({
        method: 'get',
        uri: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        qs: {
            input: searchText,
            key: config.GOOGLE_PLACES_SECRET
        }
    }, function(error, response, body) {
        let resolvedResponse = JSON.parse(body);
        let formattedResponse = [];
        for (let i = 0; i < resolvedResponse.predictions.length; i++) {
            formattedResponse.push({
                address: resolvedResponse.predictions[i].description,
                place_id: resolvedResponse.predictions[i].place_id
            });
        }
        res.json({
            addresses: formattedResponse,
        })
    })
}

function registerMostRecentSearchLocation(req, res, next) {
    const loggedInUser = req.user;
    const { address, place_id } = req.query;
    User.findById(loggedInUser)
        .exec(function(err, user) {
            getLatAndLong(place_id, function(err, result) {
                if (err) {
                    res.json({ error: err });
                } else {
                    user.loc = {
                        "type": "Point",
                        "coordinates": [result.longitude, result.latitude],
                        place_id: place_id,
                        searchText: address
                    };
                    // check whether the location already exists in userSeachLocations with place_id
                    let saveLoc = true;
                    for (var i = 0; i < user.userSeachLocations.length; i++) {
                        if (user.userSeachLocations[i].place_id === place_id) {
                            saveLoc = false;
                            break;
                        }
                    }
                    if (saveLoc) {
                        user.userSeachLocations.push({
                            "coordinates": [result.longitude, result.latitude],
                            place_id: place_id,
                            searchText: address
                        })
                    }
                    user.save(function(err, savedUser) {
                        res.json(savedUser);
                    })
                }
            })
        })
}
export default { zipcodeTypeAssist, address, addressTypeAssist, registerMostRecentSearchLocation };

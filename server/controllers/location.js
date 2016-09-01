import mongoose from 'mongoose'
import Zipcode from '../models/zipcode'
import request from 'request'
/**
 * Load
 */

function getLatAndLong(address, cb) {
    request({
        method: 'get',
        uri: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs: {
            address: address,
            key: 'AIzaSyBemekNaepB2_YeBtYSjdbnsPW9F9W8c5E'
        }
    }, function(error, response, body) {
        if (error) {
            return cb(error);
        } else {
            let resolvedResponse = JSON.parse(body);
            // take the first google recommendation
            let bestAddress = resolvedResponse.results[0].formatted_address;
            return cb(null,{
                latitude: bestAddress.geometry.location.lat,
                longitude: bestAddress.geometry.location.lng
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
    request({
        method: 'get',
        uri: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs: {
            latlng: latitude + ',' + longitude,
            key: 'AIzaSyBemekNaepB2_YeBtYSjdbnsPW9F9W8c5E'
        }
    }, function(error, response, body) {
        let resolvedResponse = JSON.parse(body);
        // take the first google recommendation
        let formattedResponse = resolvedResponse.results[0].formatted_address;
        res.json({
            address: formattedResponse
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
            key: 'AIzaSyCHB9OV1Ce85zJfCSiqZB1fL1co6y2xK9o'
        }
    }, function(error, response, body) {
        let resolvedResponse = JSON.parse(body);
        let formattedResponse = [];
        for (let i = 0; i < resolvedResponse.predictions.length; i++) {
            formattedResponse.push(resolvedResponse.predictions[i].description);
        }
        res.json({
            addresses: formattedResponse
        })
    })
}
export default { zipcodeTypeAssist, address, addressTypeAssist };

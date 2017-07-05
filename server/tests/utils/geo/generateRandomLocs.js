import config from '../../../../config/env';
import fs from 'fs';
import async from 'async'
import request from 'request'

let addresses = [];
let givenGeoGenPlaceIdArr = []
function generateRandomPoint(center, radius) {
    var y0 = center.lat;
    var x0 = center.lng;
    var rd = radius / 111300; //about 111300 meters in one degree

    var u = Math.random();
    var v = Math.random();

    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    //Adjust the x-coordinate for the shrinking of the east-west distances
    var xp = x / Math.cos(y0);

    var newlat = y + y0;
    var newlon = x + x0;
    var newlon2 = xp + x0;

    // Resulting point.
    return { 'lat': y + y0, 'lng': x + x0 };
}

function generateRandomPoints(center, radius, count) {
    var points = [];
    for (var i = 0; i < count; i++) {
        points.push(generateRandomPoint(center, radius));
    }
    return points;
}


export default function generatePlaceIds(center, radius, count,cb) {
    let geoLocs = generateRandomPoints(center, radius, count);
    for(var i=0; i< count;i++){
        givenGeoGenPlaceIdArr.push(givenGeoGenPlaceId(geoLocs[i]));
    }
    async.parallel(givenGeoGenPlaceIdArr,function(err,results){
        cb(err,addresses);
    })
}

function givenGeoGenPlaceId(center) {
    return function(cb) {
        let latitude = center.lat;
        let longitude = center.lng;
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
            let formattedResponse = resolvedResponse.results;
            for (var i = 0; i < formattedResponse.length; i++) {
                addresses.push({
                    address: formattedResponse[i].formatted_address,
                    place_id: formattedResponse[i].place_id
                });
            }
            cb();
        })
    }
}

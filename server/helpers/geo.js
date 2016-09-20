import request from 'request'
import config from '../../config/env/index'


export function getLatAndLong(place_id, cb) {
    if (place_id) {
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
                // take the first google recommendation .. i trust you google
                let bestAddress = resolvedResponse.results[0];
                return cb(null, {
                    latitude: bestAddress.geometry.location.lat,
                    longitude: bestAddress.geometry.location.lng,
                    place_id: place_id
                })
            }
        })
    } else{
        cb(new Error('place_id is a required arg'));
    }

}

export function saveLocation(user, result, place_id, address, action) {
    /**
     * check if the person is provider/consumer
     * provider should only add it to the userSeachLocations array
     * consumer should add it in both
     */
    if (user.userType === 'consumer' || action === 'registerProvider') {
        user.loc = {
            "type": "Point",
            "coordinates": [result.longitude, result.latitude],
            place_id: place_id,
            searchText: address
        };
    }
    // check whether the location already exists in userSeachLocations with place_id
    let saveLoc = true;
    for (var i = 0; i < user.userSeachLocations.length; i++) {
        if (user.userSeachLocations[i].place_id === place_id) {
            saveLoc = false;
            break;
        }
    }
    if (saveLoc) {
        let deliveryAddress = {
            "coordinates": [result.longitude, result.latitude],
            place_id: place_id,
            searchText: address
        };
        user.userSeachLocations.push(deliveryAddress);
        user.deliveryAddressIndex = user.userSeachLocations.length - 1;
    }
    return user;
}

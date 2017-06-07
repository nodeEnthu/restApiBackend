import request from 'request'
import config from '../../config/env/index'
import { countryToCurrencyCodeMapping } from './countryToCurrencyMapping'
import getSymbolFromCurrency from 'currency-symbol-map'

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
                let providerDisplayAddress = getProviderDisplayAddress(bestAddress);
                let resolvedResult = parseGeoLocationResults(bestAddress);
                return cb(null, {
                    latitude: bestAddress.geometry.location.lat,
                    longitude: bestAddress.geometry.location.lng,
                    place_id: place_id,
                    providerDisplayAddress: providerDisplayAddress,
                    state: resolvedResult.state,
                    country: resolvedResult.country
                })
            }
        })
    } else {
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
        // update the state and country of the user
        user.state = result.state;
        user.country = result.country;
    }
    // now if user is in registration mode ... 
    if (action === 'registerProvider') {
        user.shortAddress = (user.keepAddressPrivateFlag) ? result.providerDisplayAddress : address;
        user.fullAddress = address;
        const currencyCode = countryToCurrencyCodeMapping[result.country] || 'USD';
        const currencySymbol = getSymbolFromCurrency(currencyCode);
        // so intuitively when the person changes the price of item next time after changing his/her location
        // the food item price will adopt the new currency
        user.currency = currencySymbol;
    }
    // check whether the location already exists in userSeachLocations with place_id
    let locNotFound = true;
    let deliveryAddressIndex = 0
    for (var i = 0; i < user.userSeachLocations.length; i++) {
        if (user.userSeachLocations[i].place_id === place_id) {
            locNotFound = false;
            deliveryAddressIndex = i;
            break;
        }
    }
    if (locNotFound) {
        let deliveryAddress = {
            "coordinates": [result.longitude, result.latitude],
            place_id: place_id,
            searchText: address
        };
        user.userSeachLocations.push(deliveryAddress);
        user.deliveryAddressIndex = user.userSeachLocations.length - 1;

    } else {
        // update the delivery address index
        user.deliveryAddressIndex = deliveryAddressIndex;
    }

    return user;
}

export function getProviderDisplayAddress(result) {
    const address = parseGeoLocationResults(result);
    var resultArr = [];
    for (var key in address) {
        if (address.hasOwnProperty(key)) {
            if (address[key] && address[key].length > 0) {
                resultArr.push(address[key]);
            }
        }
    }
    let hasStreetNumber = (address["street_number"]) ? true : false;
    if (resultArr.length === 3) {
        //dont do anything
    } else if (resultArr.length === 4) {
        resultArr.splice(0, 1);
    } else if (!hasStreetNumber && resultArr.length === 5) {
        resultArr.splice(0, 1);
    } else resultArr.splice(0, 2);
    return resultArr.join(', ');
}

export function getDisplayAddress(user) {
    let address;
    if (user.userType === 'provider') {
        address = (user.keepAddressPrivateFlag) ? user.shortAddress : user.fullAddress;
    } else if (user.userType === 'consumer') {
        address = user.loc.searchText;
    }
    return address;
}

export function getSearchAddress(user) {
    let address, place_id;
    if (user.userType === 'provider') {
        address = user.userSeachLocations[user.deliveryAddressIndex].searchText;
        place_id = user.userSeachLocations[user.deliveryAddressIndex].place_id;
    } else if (user.userType === 'consumer') {
        address = user.loc.searchText;
        place_id = user.loc.place_id;
    }
    return {
        address: address,
        place_id: place_id
    }
}
export function getProviderAddress(user) {
    let address, place_id;
    address = user.loc.searchText;
    place_id = user.loc.place_id;
    return {
        address: address,
        place_id: place_id
    }
}


function parseGeoLocationResults(result) {
    const parsedResult = {}
    const { address_components } = result;

    for (var i = 0; i < address_components.length; i++) {
        for (var b = 0; b < address_components[i].types.length; b++) {
            if (address_components[i].types[b] == "street_number") {
                //this is the object you are looking for
                parsedResult.street_number = address_components[i].long_name;
                break;
            } else if (address_components[i].types[b] == "route") {
                //this is the object you are looking for
                parsedResult.street_name = address_components[i].long_name;
                break;
            } else if (address_components[i].types[b] == "sublocality_level_1") {
                //this is the object you are looking for
                parsedResult.sublocality_level_1 = address_components[i].long_name;
                break;
            } else if (address_components[i].types[b] == "sublocality_level_2") {
                //this is the object you are looking for
                parsedResult.sublocality_level_2 = address_components[i].long_name;
                break;
            } else if (address_components[i].types[b] == "sublocality_level_3") {
                //this is the object you are looking for
                parsedResult.sublocality_level_3 = address_components[i].long_name;
                break;
            } else if (address_components[i].types[b] == "neighborhood") {
                //this is the object you are looking for
                parsedResult.neighborhood = address_components[i].long_name;
                break;
            } else if (address_components[i].types[b] == "locality") {
                //this is the object you are looking for
                parsedResult.city = address_components[i].short_name;
                break;
            } else if (address_components[i].types[b] == "administrative_area_level_1") {
                //this is the object you are looking for
                parsedResult.state = address_components[i].short_name;
                break;
            } else if (address_components[i].types[b] == "country") {
                //this is the object you are looking for
                parsedResult.country = address_components[i].short_name;
                break;
            }
        }
    }
    return parsedResult;
}

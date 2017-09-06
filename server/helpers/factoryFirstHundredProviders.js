import FirstHundredProvidersCounter from './../models/firsthundredproviderscounter'

exports default function factoryFirstHundredProviders(cb) {
    firsthundredproviderscounter.find({}).then(function (promotions) {
        if (promotions && promotions instanceof Array && promotions[0]) {
            cb(null, promotions[0]);
        } else {
            var factoryObj = new FirstHundredProvidersCounter({});
            factoryObj.save(function (err, savedObj) {
                cb(err, savedObj);
            });
        }
    });
}

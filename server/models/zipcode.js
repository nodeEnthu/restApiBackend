var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Zipcode_Schema = new Schema({
  _id: String,
  city: String,
  loc: [String],
  pop:String,	
  state: String
},{ collection : 'zipcodes' });

Zipcode_Schema.virtual('zip').get(function() {
    return this._id;
});

export default mongoose.model('Zipcode', Zipcode_Schema);

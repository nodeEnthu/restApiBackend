import mongoose from 'mongoose'
import Zipcode from '../models/zipcode'

/**
 * Load
 */

function zipcodeTypeAssist (req,res,next){
	var regexp = new RegExp("^"+ req.query.search,"i");
	var cities = Zipcode.find({_id:regexp}, function(err,data){
		res.json(data);
	})
}
export default {zipcodeTypeAssist};

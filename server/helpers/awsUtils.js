import AWS from 'aws-sdk';
import request from 'request'
import fs from 'fs'
import config from '../../config/env/index'

/*
* This will initialize the AWS object at the start .
* every indtance of aws opbject should have this from now on
*/

AWS.config.update({
    "accessKeyId": config.ACCESS_KEY_ID,
    "secretAccessKey": config.SECRET_ACCESS_KEY
});

export const s3 = new AWS.S3({ region: config.REGION });

let params = {
    Bucket: config.AWS_BUCKET_NAME,
    Delete: {}
};

export function deleteAwsImage(imgNames,cb) {
	if(!(imgNames instanceof Array) && imgNames){
		var tempArr = [];
		tempArr.push(imgNames);
		imgNames = tempArr;
	}
	let deleteObj=[];
	imgNames.forEach(function(imgName){
		deleteObj.push({
			Key:imgName
		});
	});
	params.Delete.Objects = deleteObj;
    s3.deleteObjects(params, function(err, data) {
        // dont do anything here
        if(cb){
        	cb();
        }
    })
}

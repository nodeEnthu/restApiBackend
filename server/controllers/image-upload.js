import AWS from 'aws-sdk';
import request from 'request'
import fs from 'fs'
import {s3} from './../helpers/awsUtils'
import config from '../../config/env/index'
function sign(req, res, next) {
    const fileName = req.body['file-name'];
    const fileType = req.body['file-type'];
    const s3Params = {
        Bucket: config.AWS_BUCKET_NAME,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            return res.json({'error':err});
        }
        const returnData = {
            signedRequest: data,
            url: `https://${config.AWS_BUCKET_NAME}.amazonaws.com/${fileName}`

        };
        res.json(returnData);
    });
}

export default { sign };
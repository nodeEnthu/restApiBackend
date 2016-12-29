import AWS from 'aws-sdk';
import request from 'request'
import fs from 'fs'

AWS.config.update({
    "accessKeyId": "AKIAISGDIT6QWWGXAEPA",
    "secretAccessKey": "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"
});
let s3 = new AWS.S3({region:'us-west-2'});

function sign(req, res, next) {
    const fileName = req.body['file-name'];
    const fileType = req.body['file-type'];
    const s3Params = {
        Bucket: 'upload-test-dev',
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
            url: `https://upload-test-dev.amazonaws.com/${fileName}`

        };
        res.json(returnData);
    });
}

export default { sign };

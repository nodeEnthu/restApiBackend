import AWS from 'aws-sdk';
import request from 'request'
import fs from 'fs'

AWS.config.update({
    "accessKeyId": "AKIAJ3QKBUNOSWEK3VPA",
    "secretAccessKey": "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"
});
let s3 = new AWS.S3();

function sign(req, res, next) {
    const fileName = req.body['file-name'];
    const fileType = req.body['file-type'];
    const s3Params = {
        Bucket: 'image-uploader-dev-test',
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
            url: `https://image-uploader-dev-test.s3.amazonaws.com/${fileName}`
        };
        res.json(returnData);
    });
}

export default { sign };

import config from '../../config/env/index'

function envVars(req, res, next) {
    let envVar = {
        initialImageUrl: "https://s3-" + config.REGION + ".amazonaws.com/" + config.AWS_BUCKET_NAME + "/",
        googleLoginId: config.GOOGLE_LOGIN_ID,
        facebookLoginId: config.FACEBOOK_LOGIN_ID,
        oneSignalAppId:config.ONESIGNAL_APPID
    }
    res.json(envVar);
}

export default { envVars }

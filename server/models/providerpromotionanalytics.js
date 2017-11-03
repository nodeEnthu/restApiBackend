import mongoose from 'mongoose'

var ProviderPromotionAnalytics_Schema = new mongoose.Schema({
	/*id of people to whome email has been sent*/
    emailSent:[String],
    /*id of people to whome email has been sent SUCCESSFULLY*/
    success:[String],
    /* people who clicked on sign up on email*/
    enrollPageViewed:[String],
    /* people who went to provider enrollment page*/
    providerEnrollmentStarted:[String],
    /* people who went to food item enrollment page*/
    foodItemEnrollmentStarted:[String],
    /* people who went to publish page*/
    publishStarted:[String]
}, { collection: 'providerpromotionanalytics',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('ProviderPromotionAnalytics', ProviderPromotionAnalytics_Schema);

import mongoose from 'mongoose'

var Order_Schema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    _providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    itemsCheckedOut: {},
    providerName: String,
    customerName: String,
    providerAddress: String,
    customerAddress: String,
    customerEmailId: String,
    providerEmailId: String,
    cancelReason: Number,
    cancelText: String,
    /*
     * This is from the customer at the timeorder is placed
     */
    addtnlAddressInfo: String,
    /*
     * This is from the provider at the timeorder is confirmed
     */
    providerAddtnlInfo: String,
    /*
     * This is set to true if provider made changes at the time of confirmation
     */
    updatedByProvider: { type: Boolean, default: false },
    /*
     * This is by provider .. 1 = confirmed , 0 = cancelled , 2 = no action taken
     */
    status: { type: Number, default: 2 },
    orderTime: String,
    orderType: String,
    subTotal: String,
    currency: String,
    phone: String,
    modeOfPayment: String,
    mailSentToCustomer: { type: Boolean, default: false },
    mailSentToProvider: { type: Boolean, default: false },
    customerBrowserFingerprint: String,
    providerBrowserFingerprint: String,
    phone:String
}, { collection: 'orders', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Order', Order_Schema);
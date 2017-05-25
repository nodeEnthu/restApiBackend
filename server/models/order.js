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
    addtnlAddressInfo:String,
    orderType: String,
    subTotal: String,
    modeOfPayment: String,
    mailSentToCustomer:{type:Boolean, default:false},
    mailSentToProvider:{type:Boolean, default:false}
}, { collection: 'orders',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Order', Order_Schema);

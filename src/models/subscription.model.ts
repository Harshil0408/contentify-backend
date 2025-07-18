import mongoose, { Document, Model } from "mongoose";


export interface SubscriptionModel extends Document {
    subscriber: mongoose.Types.ObjectId;
    channel: mongoose.Types.ObjectId;
    subscribedAt: Date;
}

const subscriptionSchema = new mongoose.Schema<SubscriptionModel>({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true })

export const Subscription: Model<SubscriptionModel> = mongoose.model<SubscriptionModel>("Subscription", subscriptionSchema)
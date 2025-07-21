import mongoose, { Document, Model } from "mongoose";

interface LikeDoucment extends Document {
    video?: mongoose.Types.ObjectId;
    comment?: mongoose.Types.ObjectId;
    tweet?: mongoose.Types.ObjectId;
    likedBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const likeSchema = new mongoose.Schema<LikeDoucment>({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

likeSchema.index(
    { video: 1, likedBy: 1 },
    {
        unique: true,
        partialFilterExpression: { video: { $exists: true } }
    }
)


export const Like: Model<LikeDoucment> = mongoose.model<LikeDoucment>("Like", likeSchema)
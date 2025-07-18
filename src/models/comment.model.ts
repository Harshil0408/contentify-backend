import mongoose, { Document, Model } from "mongoose";


export interface CommentDoucment extends Document {
    content: string;
    user: mongoose.Schema.Types.ObjectId;
    video: mongoose.Schema.Types.ObjectId;
    parentComment?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new mongoose.Schema<CommentDoucment>({
    content: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }
}, { timestamps: true })

export const Comment: Model<CommentDoucment> = mongoose.model<CommentDoucment>("Comment", commentSchema)
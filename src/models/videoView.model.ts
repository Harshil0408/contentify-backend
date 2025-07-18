import mongoose, { Model, Schema } from "mongoose";

interface VideoViewDocument {
    user: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    viewedAt: Date;
    watchedTime: number;
    videoDuration: number;
    watchPercentage: number;
}

const videoViewSchema: Schema<VideoViewDocument> = new mongoose.Schema<VideoViewDocument>({
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
    viewedAt: {
        type: Date,
        default: Date.now // ✅ fix here
    },
    watchedTime: {
        type: Number,
        default: 0
    },
    videoDuration: {
        type: Number,
        default: 0
    },
    watchPercentage: {
        type: Number,
        default: 0
    }
})

videoViewSchema.index({ user: 1, video: 1 }, { unique: true });

export const VideoView: Model<VideoViewDocument> = mongoose.model<VideoViewDocument>(
    "VideoView",
    videoViewSchema
);
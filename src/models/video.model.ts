import mongoose, { Document, Model, Schema } from "mongoose";

export interface VideoModel extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    videoFile: string;
    videoPublicId: string;
    thumbnail: string;
    thumbnailPublicId: string;
    duration: string;
    views: number;
    downloads: number;
    tags: string[];
    isPublished: boolean;
    isDeleted: boolean;
    isPrivate: boolean;
    allowedUsers: mongoose.Types.ObjectId[];
    owner: mongoose.Types.ObjectId;
    reportedBy: mongoose.Types.ObjectId[];
    reportReason: string;
    language: string;
    category: string;
    averageWatchTime: Number;
    createdAt?: Date
    updatedAt?: Date
}

const videoSchema: Schema<VideoModel> = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoFile: {
        type: String,
        required: true
    },
    videoPublicId: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    thumbnailPublicId: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    category: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },

    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        trim: true,
        lowercase: true,
        default: []
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },

    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    reportedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    reportReason: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    averageWatchTime: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

export const Video: Model<VideoModel> = mongoose.model<VideoModel>("Video", videoSchema)
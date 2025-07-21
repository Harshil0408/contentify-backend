import mongoose, { AggregatePaginateModel, Document, Model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface VideoDocument extends Document {
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
    isSubscribed: boolean;
    createdAt?: Date
    updatedAt?: Date
}

interface VideoModel extends AggregatePaginateModel<VideoDocument> { }

const videoSchema: Schema<VideoDocument> = new mongoose.Schema({
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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

videoSchema.plugin(mongooseAggregatePaginate)

export const Video: VideoModel = mongoose.model<VideoDocument, VideoModel>(
    "Video",
    videoSchema
)
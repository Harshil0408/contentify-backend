import mongoose, { Schema, Document } from "mongoose";

export interface IWatchLater extends Document {
    user: mongoose.Types.ObjectId;
    video: mongoose.Types.ObjectId;
    createdAt: Date;
}

const watchLaterSchema = new Schema<IWatchLater>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a user can only save a video once in WatchLater
watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });

export const WatchLater = mongoose.model<IWatchLater>("WatchLater", watchLaterSchema);

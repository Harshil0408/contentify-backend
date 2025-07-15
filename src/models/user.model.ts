import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.ts";
import { AccessTokenPayload } from "../types/auth.types.ts";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    fullname: string;
    avatar: string;
    coverImage?: string;
    watchHistory?: mongoose.Types.ObjectId;
    password: string;
    refreshToken?: string;
    googleId?: string;
    isOnboarded: boolean;
    createdAt: Date;
    updatedAt: Date;

    comparePassword: (password: string) => Promise<boolean>;
    generateAccessToken: () => string;
    generateRefreshToken: () => string
}

const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        password: {
            type: String,
           

        },
        isOnboarded: {
            type: Boolean,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (): string {
    const payload: AccessTokenPayload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
        throw new ApiError(404, "Secret not found");
    }

    return jwt.sign(payload, secret, { expiresIn: '2 days' })
};

userSchema.methods.generateRefreshToken = function (): string {

    const secret = process.env.REFRESH_TOKEN_SECRET

    if (!secret) {
        throw new ApiError(404, "Secret not")
    }

    return jwt.sign(
        {
            _id: this._id,
        },
        secret,
        {
            expiresIn: '7 days'
        },
    )
}

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

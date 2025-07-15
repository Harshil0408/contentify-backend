import mongoose from "mongoose"

export interface SignupRequestBody {
    fullname: string,
    email: string,
    password: string,
    username: string
}

export interface SignupRequestFiles {
    avatar?: Express.Multer.File[]
}

export interface AccessTokenPayload {
    _id: string
    email: string,
    username: string,
    fullname: string
}

export interface LoginReqBody {
    username: string,
    email: string,
    password: string
}

export interface generateAccessAndRefreshTokens {
    accessToken: string;
    refreshToken: string
}

export interface options {
    httoOnly: boolean,
    secure: boolean
}
import { User } from "../models/user.model.ts";
import ApiError from "../utils/ApiError.ts";
import ApiResponse from "../utils/ApiResponse.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { Response, Request } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.ts";
import { generateAccessAndRefreshTokens, LoginReqBody, options, SignupRequestBody, SignupRequestFiles } from "../types/auth.types.ts";

const generateAccessAndRefreshTokens = async (userId: string): Promise<generateAccessAndRefreshTokens> => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        let accessToken = user.generateAccessToken()
        let refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user?.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Internal server error")
    }
}

const signupUser = asyncHandler(async (req: Request<{}, {}, SignupRequestBody> & { files?: SignupRequestFiles }, res: Response) => {
    const { fullname, username, email, password } = req.body

    if (
        [fullname, email, password, username].some(field => field.trim() === '')
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [
            { username }, { email }
        ]
    })

    if (existedUser) {
        throw new ApiError(409, "Username or Email already exist")
    }
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Failed to uplaod avatar to cloudinary")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        email,
        password,
        username: username.toLowerCase(),
        coverImage: '',
        isOnboarded: false,
        refreshToken: '',
        watchHistory: []
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req: Request<{}, {}, LoginReqBody>, res: Response) => {
    const { email, password, username } = req.body

    if (!username && !password) {
        throw new ApiError(400, "Username and email are required")
    }

    const user = await User.findOne({ $or: [{ email }, { username }] })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    await user?.comparePassword(password)
        .then(isMatch => {
            if (!isMatch) {
                throw new ApiError(401, "Invalid Password")
            }
        })

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString())

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options: options = {
        httoOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedIn Successfully"
        ))

})

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    req.logout((err) => {
        if (err) throw err;

        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            return res
                .status(200)
                .json(new ApiResponse(200, null, "Logged out successfully"));
        });
    });
})

export {
    signupUser,
    logoutUser,
    loginUser
}
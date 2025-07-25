import { Request, Response } from "express";
import { OnboardingPayload } from "../types/user.types.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { IUser, User } from "../models/user.model.ts";
import ApiError from "../utils/ApiError.ts";
import ApiResponse from "../utils/ApiResponse.ts";
import { getUserIdFromRequest } from "../constants/index.ts";


const onboarding = asyncHandler(async (req: Request<{}, {}, OnboardingPayload>, res: Response) => {
    const userId = getUserIdFromRequest(req)

    console.log(userId)

    const { age, city, hobby, language, phoneNo } = req.body

    if (!userId) {
        console.log("called")
        throw new ApiError(401, "Unauthorized")
    }

    const updatedUser = await User.findByIdAndUpdate(
        { _id: userId },
        {
            age,
            city,
            hobby,
            language,
            phoneNo,
            isOnboarded: true
        },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User onboarded successfully")
    )

})

export {
    onboarding
}
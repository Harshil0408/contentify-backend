import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.ts";
import ApiError from "../utils/ApiError.ts";
import { Like } from "../models/like.model.ts";
import ApiResponse from "../utils/ApiResponse.ts";
import { getUserIdFromRequest } from "../constants/index.ts";

const toggleLikeVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const userId = getUserIdFromRequest(req);

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        await Like.deleteOne({ video: videoId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, null, "Video unliked"));
    }

    await Like.create({ video: videoId, likedBy: userId });

    return res.status(200).json(new ApiResponse(200, null, "Video liked"));
});


export {
    toggleLikeVideo
}
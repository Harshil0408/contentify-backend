import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.ts";
import { PublishVideoBody, PublishVideoFile } from "../types/video.types";
import ApiError from "../utils/ApiError.ts";
import { uploadOnCloudinary } from "../utils/cloudinary.ts";
import { Video } from "../models/video.model.ts";
import { getUserIdFromRequest } from "../constants/index.ts";
import ApiResponse from "../utils/ApiResponse.ts";


const publishVideo = asyncHandler(async (req: Request, res: Response) => {
    const { description, title, category } = req.body as PublishVideoBody;
    const userId = getUserIdFromRequest(req)
    const files = req.files as PublishVideoFile | undefined;
    const videoFile = files?.videoFile?.[0]?.path;
    const thumbnail = files?.thumbnail?.[0]?.path;


    if (!title || !description || !videoFile || !thumbnail || !category) {
        throw new ApiError(400, "All fiels are required")
    }

    const videoUploadedOnCloudinary = await uploadOnCloudinary(videoFile)
    const thumbnailUploadedOnCloudinary = await uploadOnCloudinary(thumbnail)

    const videoPublicId = videoUploadedOnCloudinary?.public_id
    const thumbnailPublicId = thumbnailUploadedOnCloudinary?.public_id

    const duration = videoUploadedOnCloudinary?.duration

    const newVideo = await Video.create({
        title,
        description,
        category,
        duration: `${Math.floor(duration)}`,
        videoFile: videoUploadedOnCloudinary?.secure_url,
        videoPublicId,
        thumbnail,
        thumbnailPublicId,
        owner: userId,
        isPublished: true,
        views: 0
    })

    return res.status(200).json(
        new ApiResponse(200, newVideo, "Video published successfully")
    )

})

export {
    publishVideo
}
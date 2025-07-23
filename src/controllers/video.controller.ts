import mongoose from "mongoose";
import ApiError from "../utils/ApiError.ts";
import { Request, Response } from "express";
import { User } from "../models/user.model.ts";
import ApiResponse from "../utils/ApiResponse.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { VideoView } from "../models/videoView.model.ts";
import { getUserIdFromRequest } from "../constants/index.ts";
import { Video } from "../models/video.model.ts";
import { deleteCloudinaryFiles, uploadOnCloudinary } from "../utils/cloudinary.ts";
import { GetAllVideosReqQuery, PublishVideoBody, PublishVideoFile, VideoUpdateBody } from "../types/video.types";
import { Like } from "../models/like.model.ts";
import { Subscription } from "../models/subscription.model.ts";

interface VideoIdParams {
    videoId: string;
}

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
        thumbnail: thumbnailUploadedOnCloudinary?.secure_url,
        thumbnailPublicId,
        owner: userId,
        isPublished: true,
        views: 0
    })

    return res.status(200).json(
        new ApiResponse(200, newVideo, "Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const userId = getUserIdFromRequest(req);

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    await User.findByIdAndUpdate(userId, {
        $pull: { watchHistory: videoId },
    });
    await User.findByIdAndUpdate(userId, {
        $push: { watchHistory: { $each: [videoId], $position: 0 } },
    });

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                isDeleted: false,
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { _id: 1, username: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$owner" },
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
                    { $count: "likeCount" }
                ],
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$video", "$$videoId"] },
                                    { $eq: ["$likedBy", new mongoose.Types.ObjectId(userId)] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1 } }
                ],
                as: "isLikedArray"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                let: { ownerId: "$owner._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$ownerId"] },
                                    { $eq: ["$subscriber", new mongoose.Types.ObjectId(userId)] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1 } }
                ],
                as: "isSubscribedArray"
            }
        },
        {
            $addFields: {
                likeCount: { $ifNull: [{ $arrayElemAt: ["$likes.likeCount", 0] }, 0] },
                isLiked: { $gt: [{ $size: "$isLikedArray" }, 0] },
                isSubscribed: { $gt: [{ $size: "$isSubscribedArray" }, 0] }
            }
        },
        {
            $project: {
                isLikedArray: 0,
                isSubscribedArray: 0,
                likes: 0,
                __v: 0,
                cloudinary_public_id: 0
            }
        }
    ]);

    if (!video || video.length === 0) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched and added to watch history")
    );
});


const updateWatchProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const { videoId, watchedTime } = req.body as {
        videoId: string;
        watchedTime: number;
    };

    const videoView = await VideoView.findOne({ user: userId, video: videoId });
    if (!videoView) {
        throw new ApiError(404, "Video view not found");
    }

    const totalDuration = videoView.videoDuration || 1;
    const percentage = Math.min(100, (watchedTime / totalDuration) * 100);

    videoView.watchedTime = watchedTime;
    videoView.watchPercentage = percentage;
    await videoView.save();

    await User.findByIdAndUpdate(userId, {
        $pull: { watchHistory: videoId },
    });
    await User.findByIdAndUpdate(userId, {
        $push: { watchHistory: { $each: [videoId], $position: 0 } },
    });

    return res.status(200).json(
        new ApiResponse(200, videoView, "Watched progress updated")
    );
});

const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query as unknown as GetAllVideosReqQuery

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
            {
                $match: {
                    isPublished: true,
                    ...(userId && { owner: userId }),
                    ...(query && { title: { $regex: query, $options: "i" } })
                }
            },
            {
                $sort: {
                    [sortBy]: sortType === 'asc' ? 1 : -1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: "ownerDetails"
                }
            },
            {
                $unwind: {
                    path: "$ownerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    videoFile: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                    owner: 1,
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar",
                }
            }
        ]),
        {
            page: page,
            limit: limit
        }
    )

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )

})

const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params as unknown as VideoIdParams
    const updates = req.body as VideoUpdateBody
    const userId = getUserIdFromRequest(req)

    const files = req.files as PublishVideoFile | undefined
    const videoFile = files?.videoFile?.[0]?.path
    const thumbnail = files?.thumbnail?.[0]?.path

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId) {
        throw new ApiError(401, "Video can be updated by only owner of this video")
    }

    if (videoFile) {
        try {
            const newVideoUpload = await uploadOnCloudinary(videoFile)

            if (!newVideoUpload?.secure_url || !newVideoUpload.public_id || !newVideoUpload.duration) {
                throw new ApiError(500, "Invalid video upload response")
            }

            if (video.videoPublicId) {
                await deleteCloudinaryFiles(video.videoPublicId, "video")
            }

            video.videoFile = newVideoUpload.secure_url
            video.videoPublicId = newVideoUpload.public_id
            video.duration = (Math.floor(newVideoUpload.duration)).toString()

        } catch (error) {
            throw new ApiError(500, "Failed to update video")
        }
    }

    if (thumbnail) {
        try {
            const newThumbnailUpload = await uploadOnCloudinary(thumbnail)
            console.log("called1")
            if (!newThumbnailUpload?.secure_url || !newThumbnailUpload.public_id) {
                throw new ApiError(500, "Invalid thumbnail upload response")
            }
            console.log("called2")
            if (video.thumbnailPublicId) {
                await deleteCloudinaryFiles(video.thumbnailPublicId, "image")
            }
            console.log("called4")
            video.thumbnail = newThumbnailUpload.secure_url
            video.thumbnailPublicId = newThumbnailUpload.public_id
            console.log("called5")
        } catch (error) {
            throw new ApiError(500, "Failed to update thumbnail")
        }
    }

    if (updates && Object.keys(updates).length > 0) {
        for (const key of Object.keys(updates)) {
            if (key in video) {
                (video as any)[key] = (updates as any)[key]
            }
        }
    }

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params as unknown as VideoIdParams
    const userId = getUserIdFromRequest(req)

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== userId) {
        throw new ApiError(401, "Video can be deleted by only owner of the video")
    }

    try {
        if (video.videoPublicId) {
            await deleteCloudinaryFiles(video.videoPublicId, "video")
        }
    } catch (error) {
        console.log("Failed to delete video")
    }

    try {
        if (video.thumbnailPublicId) {
            await deleteCloudinaryFiles(video.thumbnailPublicId, "image")
        }
    } catch (error) {
        console.log("Failed to delete thumbnail")
    }

    await video.deleteOne()

    return res.status(200).json(
        new ApiResponse(200, null, "Video is deleted succesfully")
    )

})

const getRecommandationVideos = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const { currentVideoId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(currentVideoId as string)) {
        throw new ApiError(400, "Invalid currentVideoId");
    }

    const currentVideoObjectId = new mongoose.Types.ObjectId(currentVideoId as string);

    const currentvideo = await Video.findById(currentVideoObjectId).lean();
    if (!currentvideo) {
        throw new ApiError(404, "Current video not found");
    }

    const watchedVideoViews = await VideoView.find({
        user: userId,
        watchPercentage: { $gte: 90 }
    }).select("video");

    const watchedVideoIds = watchedVideoViews.map(v => v.video.toString());

    const excludeIds = [
        ...watchedVideoIds.map(id => new mongoose.Types.ObjectId(id)),
        currentVideoObjectId
    ];

    const sameChannelVideos = await Video.find({
        owner: currentvideo.owner,
        _id: { $nin: excludeIds },
        isDeleted: false,
        isPublished: true
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("owner", "username avatar");

    const mostCommented = await Video.aggregate([
        {
            $match: {
                isDeleted: false,
                isPublished: true,
                _id: { $nin: excludeIds }
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: { commentsCount: { $size: "$comments" } }
        },
        { $sort: { commentsCount: -1 } },
        { $limit: 5 }
    ]);

    const mostLiked = await Video.aggregate([
        {
            $match: {
                isDeleted: false,
                isPublished: true,
                _id: { $nin: excludeIds }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: { likeCount: { $size: "$likes" } }
        },
        { $sort: { likeCount: -1 } },
        { $limit: 5 }
    ]);

    const tagMatched = await Video.find({
        tags: { $in: currentvideo.tags },
        _id: { $nin: excludeIds.map(id => id.toString()) },
        isDeleted: false,
        isPublished: true
    })
        .limit(5)
        .populate("owner", "username avatar");

    const recommendedMap = new Map<string, any>();

    [...sameChannelVideos, ...mostCommented, ...mostLiked, ...tagMatched].forEach(video => {
        const id = (video._id || video._id?.toString()).toString();
        if (!recommendedMap.has(id)) {
            recommendedMap.set(id, video);
        }
    });

    const recommended = Array.from(recommendedMap.values()).filter(
        video => video._id.toString() !== currentVideoObjectId.toString()
    ).slice(0, 15);

    return res.status(200).json(
        new ApiResponse(200, recommended, "Recommended videos fetched successfully")
    );
});

const getWatchUserHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const user = await User.findById(userId)
        .populate({
            path: "watchHistory",
            populate: {
                path: "owner",
                select: "username avatar"
            },
            select: "title thumbnail duration views createdAt owner"
        });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user.watchHistory, "Watch history fetched successfully")
    );
});

const likedVideosController = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req)

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid UserId")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $lookup: {
                from: 'users',
                localField: 'video.owner',
                foreignField: "_id",
                as: "video.owner"
            }
        },
        {
            $unwind: "$video.owner"
        },
        {
            $project: {
                _id: 1,
                likedAt: "$createdAt",
                videoId: "$video._id",
                title: "$video.title",
                thumbnail: "$video.thumbnail",
                views: "$video.views",
                duration: "$video.duration",
                owner: {
                    _id: "$video.owner._id",
                    name: "$video.owner.name",
                    avatar: "$video.owner.avatar",
                }
            }
        },
        {
            $sort: { likedAt: -1 }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, { totalLikedVideos: likedVideos.length, videos: likedVideos }, "Liked videos fetched successfully")
    )

})

const getUsersVideos = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req)

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const videos = await Video.aggregatePaginate(
        Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: "owner"
                }
            },
            {
                $unwind: '$owner'
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'video',
                    as: 'likes'
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    thumbnail: 1,
                    videoFile: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    createdAt: 1,
                    duration: 1,
                    owner: {
                        _id: "$owner._id",
                        username: "$owner.username",
                        avatar: "$owner.avatar",
                    },
                    likesCount: { $size: "$likes" }
                }
            }
        ]),
        {
            page,
            limit
        }
    )

    return res.status(200).json(
        new ApiResponse(200, videos, "User's video fetched successfully")
    )

})

const getAllVideoProgressForUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req)

    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    const progressList = await VideoView.find({ user: userId }).select("video watchedTime videoDuration watchPercentage").lean()

    const progressMap = progressList.reduce((acc, item) => {
        acc[item.video.toString()] = {
            watchedTime: item.watchedTime,
            videoDuration: item.videoDuration,
            watchPercentage: item.watchPercentage
        }
        return acc;
    }, {} as Record<string, { watchedTime: number; videoDuration: number, watchPercentage: number }>)

    return res.status(200).json(
        new ApiResponse(200, progressMap, "Video Progress fetched")
    )

})

const getSubscribedChannelVideos = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const subscription = Subscription.find({ subscriber: userId }).select("channel")

    const subscribedChannelIds = (await subscription).map((sub) => sub.channel)

    if (!subscribedChannelIds.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No subscribed channels")
        )
    }

    const aggregateQuery = Video.aggregate([
        {
            $match: {
                isDeleted: false,
                isPrivate: false,
                isPublished: true,
                owner: { $in: subscribedChannelIds }
            }
        },
        {
            $sort: { createdAt: -1 }
        },

    ])

    const options = {
        page,
        limit
    }

    const result = await Video.aggregatePaginate(aggregateQuery, options)

    return res.status(200).json(
        new ApiResponse(200, result, "Subscribed channel videos fetched successfully")
    )

})


export {
    publishVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    getRecommandationVideos,
    getWatchUserHistory,
    likedVideosController,
    getUsersVideos,
    updateWatchProgress,
    getAllVideoProgressForUser,
    getSubscribedChannelVideos
}
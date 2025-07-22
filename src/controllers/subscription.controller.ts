import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.ts";
import { getUserIdFromRequest } from "../constants/index.ts";
import ApiError from "../utils/ApiError.ts";
import { Subscription } from "../models/subscription.model.ts";
import ApiResponse from "../utils/ApiResponse.ts";
import { User } from "../models/user.model.ts";

const toggleSubscribeChannel = asyncHandler(async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const userId = getUserIdFromRequest(req);

    if (!channelId) {
        throw new ApiError(400, "ChannelId is required");
    }

    const channelUser = await Subscription.findById(channelId).select("username")
    const subscriberUser = await User.findById(userId).select("username")

    const existingSubscription = await Subscription.findOne({ channel: channelId, subscriber: userId });

    if (existingSubscription) {
        await Subscription.deleteOne({ channel: channelId, subscriber: userId });
        return res.status(200).json(new ApiResponse(200, null, "Channel unsubscribed"));
    }

    await Subscription.create({ channel: channelId, subscriber: userId });

    return res.status(200).json(new ApiResponse(200, null, "Channel subscribed"));
});


export {
    toggleSubscribeChannel
}
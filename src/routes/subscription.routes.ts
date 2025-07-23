import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import { toggleSubscribeChannel } from "../controllers/subscription.controller.ts";
import { getSubscribedChannelVideos } from "../controllers/video.controller.ts";

const router = Router()

router.post('/toggle-subscribe/:channelId',
    isAuthenticated,
    toggleSubscribeChannel
)

router.get(
    '/subscribed-videos',
    getSubscribedChannelVideos
)

export default router
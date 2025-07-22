import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import { toggleSubscribeChannel } from "../controllers/subscription.controller.ts";

const router = Router()

router.post('/toggle-subscribe/:channelId',
    isAuthenticated,
    toggleSubscribeChannel
)

export default router
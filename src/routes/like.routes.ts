import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import { toggleLikeVideo } from "../controllers/Like.controller.ts";

const router = Router()

router.post('/like-video/:videoId',
    isAuthenticated,
    toggleLikeVideo
)

export default router
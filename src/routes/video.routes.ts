import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { publishVideo } from "../controllers/video.controller.ts";


const router = Router()

router.post('/publish-video',
    isAuthenticated,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishVideo
)

export default router
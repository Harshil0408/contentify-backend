import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.ts";
import { upload } from "../middlewares/multer.middleware.ts";
import { deleteVideo, getAllVideos, getRecommandationVideos, getUsersVideos, getUserVideoWatchProgress, getVideoById, getWatchUserHistory, likedVideosController, publishVideo, updateVideo, updateWatchProgress } from "../controllers/video.controller.ts";


const router = Router()

router.get('/recommend-video',
    isAuthenticated,
    getRecommandationVideos
)

router.post('/publish-video',
    isAuthenticated,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishVideo
)

router.get('/:videoId',
    isAuthenticated,
    getVideoById
)

router.get('/',
    isAuthenticated,
    getAllVideos
)

router.patch('/:videoId',
    isAuthenticated,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    updateVideo
)

router.delete('/:videoId',
    isAuthenticated,
    deleteVideo
)

router.get('/video/getWatchHistory',
    isAuthenticated,
    getWatchUserHistory
)

router.get('/like-videos/user',
    isAuthenticated,
    likedVideosController
)

router.get('/user/user-videos',
    isAuthenticated,
    getUsersVideos
)

router.patch('/update/watch-progress',
    isAuthenticated,
    updateWatchProgress
)

router.get('/watch-progress/:videoId',
    isAuthenticated,
    getUserVideoWatchProgress
)

export default router
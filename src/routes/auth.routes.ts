import express from 'express'
import passport from 'passport'
import { isAuthenticated } from '../middlewares/authMiddleware.ts'
import { loginUser, logoutUser, signupUser } from '../controllers/auth.controller.ts'
import { upload } from '../middlewares/multer.middleware.ts'
import { IUser } from '../models/user.model.ts'
import { onboarding } from '../controllers/user.controller.ts'

const router = express.Router()

router.get('/google', passport.authenticate("google", { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate("google", {
    failureRedirect: "/login",
    session: false
}), (req, res) => {
    const user = req.user as IUser

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    res.redirect(`http://localhost:5173/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`)
})

router.get("/me", isAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

router
    .route("/signup")
    .post(
        upload.single('avatar'),
        signupUser
    )

router
    .route("/signin")
    .post(
        loginUser
    )

router
    .route('/onboarding')
    .patch(
        isAuthenticated,
        onboarding
    )

router.get("/logout", isAuthenticated, logoutUser)

export default router
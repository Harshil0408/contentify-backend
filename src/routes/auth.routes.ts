import express from 'express'
import passport from 'passport'
import { isAuthenticated } from '../middlewares/authMiddleware.ts'
import { loginUser, logoutUser, signupUser } from '../controllers/auth.controller.ts'
import { upload } from '../middlewares/multer.middleware.ts'

const router = express.Router()

router.get('/google', passport.authenticate("google", { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate("google", {
    failureRedirect: "/login",
    session: true
}), (req, res) => {
    res.redirect("/dashboard")
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
    .route("/login")
    .post(
        loginUser
    )

router.get("/logout", isAuthenticated, logoutUser)

export default router
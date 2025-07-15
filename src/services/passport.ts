import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { User, IUser } from "../models/user.model.ts";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: (error: any, user?: any) => void
        ) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    const email = profile.emails?.[0].value;
                    const username = email?.split("@")[0] || profile.id;
                    user = await User.create({
                        googleId: profile.id,
                        email: email!,
                        fullname: profile.displayName,
                        username,
                        avatar: profile.photos?.[0].value || "",
                        coverImage: "",
                        watchHistory: [],
                        age: null,
                        language: '',
                        city: '',
                        phoneNo: null,
                        hobby: [],
                        isOnboarded: false,
                        refreshToken: ""
                    });
                }

                done(null, user);
            } catch (error) {
                done(error, undefined);
            }
        }
    )
);

passport.serializeUser((user: Express.User, done: (error: any, user?: any) => void) => {
    done(null, (user as IUser)._id);
});

passport.deserializeUser(async (id: string, done: (error: any, user?: any) => void) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import './services/passport.ts'
import MongoStore from "connect-mongo";

import authRoutes from "./routes/auth.routes.ts";

const app: Application = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI!,
        collectionName: "sessions",
    }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
    },
}));


app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

export { app };

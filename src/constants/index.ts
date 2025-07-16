import { Request } from "express";
import { IUser } from "../models/user.model";
export const DB_NAME = "advanced_backend"

export const getUserIdFromRequest = (req: Request): string => {
    if (!req.user) throw new Error("Unauthorized");
    return (req.user as IUser)._id.toString();
};
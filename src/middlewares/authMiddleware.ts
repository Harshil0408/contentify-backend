import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/user.model.ts";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  
  const authHeader = req.cookies.accessToken;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET
    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(authHeader, secret);
    const user = await User.findById((decoded as any)._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user as IUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

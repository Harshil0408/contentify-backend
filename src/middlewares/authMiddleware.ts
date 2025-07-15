import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/user.model.ts";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
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

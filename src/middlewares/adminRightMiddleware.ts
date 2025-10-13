import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import authServices from "../services/baseService/authServices.js";

export const adminRightMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id;
  const isAdmin = (await authServices.findUserByID(userId)).isAdmin;
  if (!isAdmin) {
    return res.status(403).json({
      status: 403,
      message: "you don't have admin right",
      errCode: "login with a admin account",
    });
  }
  next();
};

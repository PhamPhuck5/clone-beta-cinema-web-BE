import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserPayload } from "../services/authServices/jwtServices.js";

const { TokenExpiredError } = jwt;

export interface AuthRequest extends Request {
  user?: JwtPayload & UserPayload;
}
// const SECRET_KEY = process.env.ACCESS_KEY!;
// console.log("access key for check access token: " + SECRET_KEY);
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("auth middleware start working");

  if (!token)
    return res.status(401).json({
      status: 401,
      message: "missing refresh token",
      errCode: "login",
    });

  jwt.verify(token, process.env.ACCESS_KEY!, (err, userInfo) => {
    if (err || !userInfo) {
      //token expired
      if (err instanceof TokenExpiredError) {
        return res.status(401).json({
          status: 401,
          message: "Token expired",
          errCode: "login", //todo to do if rotation token remove this errCode
        });
      }
      console.log("token error:" + err);

      //invalid token
      return res.status(403).json({
        status: 403,
        message: "Invalid token",
        errCode: "login",
      });
    }

    req.user = userInfo as JwtPayload & UserPayload;
    console.log("auth middleware verify success");

    next();
  });
}

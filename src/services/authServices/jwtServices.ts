import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import express, { Request, Response } from "express";

const app = express();

const ACCESS_SECRET = process.env.ACCESS_KEY!;
const REFRESH_SECRET = process.env.REFRESH_KEY!;
console.log("access key for gen access token: " + ACCESS_SECRET);

// Giả lập DB lưu refresh tokens
// let refreshTokens: string[] = [];

interface UserPayload {
  id: number;
  role_priority: number;
}

function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "60m" });
}

function generateRefreshToken(payload: UserPayload): string {
  const refreshTokens = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  //todo to do save this to db
  return refreshTokens;
}

export { generateAccessToken, generateRefreshToken, UserPayload };

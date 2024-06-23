import { Response } from "express";
import jwt from "jsonwebtoken";

export const generateAccessToken = async (payload: object) => {
  return await jwt.sign(payload, String(process.env.ACCESS_TOKEN_SECRET), {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = async (payload: object, res: Response) => {
  const refreshToken = await jwt.sign(
    payload,
    String(process.env.REFRESH_TOKEN_SECRET),
    {
      expiresIn: "30d",
    }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/auth/api/refresh_token",
    secure: true,
    maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  });

  return refreshToken;
};

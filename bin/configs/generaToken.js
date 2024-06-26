"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = async (payload) => {
    return await jsonwebtoken_1.default.sign(payload, String(process.env.ACCESS_TOKEN_SECRET), {
        expiresIn: "1d",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (payload, res) => {
    const refreshToken = await jsonwebtoken_1.default.sign(payload, String(process.env.REFRESH_TOKEN_SECRET), {
        expiresIn: "30d",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 30 * 7 * 24 * 60 * 60 * 1000,
    });
    return refreshToken;
};
exports.generateRefreshToken = generateRefreshToken;

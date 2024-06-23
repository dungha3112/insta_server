"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token)
            return res.status(500).json({ msg: "Invalid Authentication." });
        const decoded = (jsonwebtoken_1.default.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`));
        if (!decoded)
            return res.status(500).json({ msg: "Invalid Authentication." });
        const user = await userModel_1.default.findById(decoded.id);
        if (!user)
            return res.status(500).json({ msg: "Invalid Authentication." });
        req.user = user;
        next();
    }
    catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
exports.default = auth;

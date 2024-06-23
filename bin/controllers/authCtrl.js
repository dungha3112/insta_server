"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generaToken_1 = require("../configs/generaToken");
const userModel_1 = __importDefault(require("../models/userModel"));
class authCtrl {
    async signup(req, res) {
        try {
            const { email, fullname, gender, username, password } = req.body;
            let newUserName = username.toLowerCase().replace(/ /g, "");
            const new_username = await userModel_1.default.findOne({ username: newUserName });
            if (new_username)
                return res.status(400).json({ msg: "This username already exists." });
            const user_email = await userModel_1.default.findOne({ email: email });
            if (user_email)
                return res.status(400).json({ msg: "This email already exists." });
            const hashPassword = await bcrypt_1.default.hash(password, 12);
            const newUser = new userModel_1.default({
                email,
                fullname,
                gender,
                username,
                password: hashPassword,
            });
            await newUser.save();
            const access_token = await (0, generaToken_1.generateAccessToken)({ id: newUser._id });
            const refresh_token = await (0, generaToken_1.generateRefreshToken)({ id: newUser._id }, res);
            newUser.refreshToken = refresh_token;
            await newUser.save();
            res.status(200).json({
                msg: "Register successfully",
                access_token,
                user: { ...newUser._doc, password: "", refreshToken: "" },
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async signin(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userModel_1.default.findOne({ email })
                .select("+password")
                .populate("followers following", "avatar username fullname followers following");
            if (!user)
                return res.status(400).json({ msg: "User not found with email." });
            const isMatchedPassword = await bcrypt_1.default.compare(password, user.password);
            if (!isMatchedPassword)
                return res.status(400).json({ msg: "Invalid password" });
            const access_token = await (0, generaToken_1.generateAccessToken)({ id: user._id });
            const refresh_token = await (0, generaToken_1.generateRefreshToken)({ id: user._id }, res);
            user.refreshToken = refresh_token;
            await user.save();
            res.status(200).json({
                msg: "Login successfully",
                access_token,
                user: { ...user._doc, password: "", refreshToken: "" },
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async refreshToken(req, res) {
        try {
            const rf_token = req.cookies.refreshToken;
            if (!rf_token)
                return res.status(403).json({ msg: "Please login now." });
            const decoded = (await jsonwebtoken_1.default.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`));
            const user = await userModel_1.default.findById(decoded.id)
                .select("-password +refreshToken")
                .populate("followers following", "avatar username fullname followers following");
            if (!user)
                return res.status(400).json({ msg: "This account does not exist." });
            if (rf_token !== user.refreshToken)
                return res.status(400).json({ msg: "Please, login now!." });
            const access_token = await (0, generaToken_1.generateAccessToken)({ id: user._id });
            const refresh_token = await (0, generaToken_1.generateRefreshToken)({ id: user._id }, res);
            user.refreshToken = refresh_token;
            await user.save();
            res.json({
                access_token,
                user: { ...user._doc, refreshToken: "" },
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async logout(req, res) {
        try {
            res.clearCookie("refreshToken");
            await userModel_1.default.findById(req.user?._id, { refreshToken: "" }, { new: true });
            res.status(200).json({ msg: "Logged" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
}
exports.default = new authCtrl();

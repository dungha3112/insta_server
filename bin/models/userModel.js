"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    fullname: { type: String, required: true, trim: true, maxLength: 25 },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, minLength: 6, select: false },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dunghaqn/image/upload/v1657204516/samples/avatar/avatar_cugq40_iykwuo.png",
    },
    role: { type: String, default: "user" },
    gender: { type: String, default: "male" },
    mobile: { type: String, default: "" },
    bio: { type: String, default: "" },
    story: { type: String, default: "", maxLength: 200 },
    website: { type: String, default: "" },
    followers: [{ type: mongoose_1.default.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose_1.default.Types.ObjectId, ref: "User" }],
    saved: [{ type: mongoose_1.default.Types.ObjectId, ref: "Post", default: [] }],
    refreshToken: { type: String, default: "", select: false },
    historySearch: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "User",
            default: [],
            select: false,
        },
    ],
}, {
    timestamps: true,
});
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;

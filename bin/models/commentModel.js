"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    content: { type: String, required: true },
    tag: Object,
    reply: { type: mongoose_1.default.Types.ObjectId, ref: "Comment" },
    postId: { type: mongoose_1.default.Types.ObjectId, ref: "Post" },
    likes: [{ type: mongoose_1.default.Types.ObjectId, ref: "User" }],
    user: { type: mongoose_1.default.Types.ObjectId, ref: "User" },
    postUserId: { type: mongoose_1.default.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
});
const CommentModel = mongoose_1.default.model("Comment", commentSchema);
exports.default = CommentModel;

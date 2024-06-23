"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commentModel_1 = __importDefault(require("../models/commentModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
class commentCtrl {
    async createComment(req, res) {
        try {
            const { postId, content, tag, reply, postUserId } = req.body;
            const post = await postModel_1.default.findById(postId);
            if (!post)
                return res.status(400).json({ msg: "This post does not exist." });
            if (reply) {
                const cm = await commentModel_1.default.findById(reply);
                if (!cm)
                    return res.status(400).json({ msg: "This comment does not exist." });
            }
            const newComment = new commentModel_1.default({
                user: req.user?._id,
                content,
                tag,
                reply,
                postId,
                postUserId,
            });
            await postModel_1.default.findByIdAndUpdate(postId, { $push: { comments: newComment._id } }, { new: true });
            await newComment.save();
            res.status(200).json({ newComment });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async updateComment(req, res) {
        try {
            const { content } = req.body;
            const newComment = await commentModel_1.default.findOneAndUpdate({ _id: req.params.commentId, user: req.user?._id }, { content }, { new: true });
            if (!newComment)
                return res.status(400).json({ msg: "Wrong!" });
            res.status(200).json({ msg: "Updated comment" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getCommentLike(req, res) {
        try {
            const comment = await commentModel_1.default.findById(req.params.commentId).populate({
                path: "likes",
                select: "_id avatar username fullname followers following",
                populate: {
                    path: "followers following",
                    select: "_id avatar username fullname",
                },
            });
            res.status(200).json(comment?.likes);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async likeComment(req, res) {
        try {
            const comment = await commentModel_1.default.find({
                _id: req.params.commentId,
                likes: req.user?._id,
            });
            if (comment.length > 0)
                return res.status(400).json({ msg: "You liked this comment." });
            await commentModel_1.default.findOneAndUpdate({ _id: req.params.commentId }, {
                $push: { likes: req.user?._id },
            }, { new: true });
            res.status(200).json({ msg: "Liked Comment!" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async unLikeComment(req, res) {
        try {
            await commentModel_1.default.findOneAndUpdate({ _id: req.params.commentId }, {
                $pull: { likes: req.user?._id },
            }, { new: true });
            res.status(200).json({ msg: "UnLiked Comment!" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteComment(req, res) {
        try {
            const comment = await commentModel_1.default.findOneAndDelete({
                _id: req.params.commentId,
            });
            if (!comment)
                return res.status(400).json({ msg: "Comment not found." });
            await postModel_1.default.findOneAndUpdate({ _id: comment.postId._id }, { $pull: { comments: req.params.commentId } });
            res.status(200).json({ msg: "Delete Comment!" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
}
exports.default = new commentCtrl();

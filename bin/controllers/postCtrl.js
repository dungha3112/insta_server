"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commentModel_1 = __importDefault(require("../models/commentModel"));
const postModel_1 = __importDefault(require("../models/postModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    paginating() {
        const page = Number(this.queryString.page) * 1 || 1;
        const limit = Number(this.queryString.limit * 1) || 9;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
class postCtrl {
    async createPost(req, res) {
        try {
            const { content, images } = req.body;
            if (images?.length === 0)
                return res.status(400).json({ msg: "Please add image." });
            if (content.length === 0)
                return res.status(400).json({ msg: "Please add content." });
            const newPost = new postModel_1.default({ content, images, user: req.user?._id });
            await newPost.save();
            res.status(200).json({
                msg: "Create posts.",
                newPost: { ...newPost._doc, user: req.user },
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getPosts(req, res) {
        try {
            const features = new APIfeatures(postModel_1.default.find({
                user: [...req.user?.following, req.user?._id],
            }), req.query).paginating();
            const posts = await features.query
                .populate([
                {
                    path: "user",
                    select: "_id avatar username fullname followers",
                },
                {
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "_id avatar username fullname",
                    },
                },
            ])
                .sort("-createdAt");
            res.status(200).json({
                msg: "Get posts.",
                result: posts.length,
                posts,
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async updatePost(req, res) {
        try {
            const { content, images } = req.body;
            if (images?.length === 0)
                return res.status(400).json({ msg: "Please add image." });
            if (content.length === 0)
                return res.status(400).json({ msg: "Please add content." });
            const checkPost = await postModel_1.default.findOne({
                _id: req.params.postId,
                user: req.user?._id,
            });
            if (!checkPost)
                return res.status(400).json({ msg: "You con't edit post." });
            const post = await postModel_1.default.findByIdAndUpdate(req.params.postId, { content, images }, { new: true }).populate([
                {
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "_id avatar username fullname",
                    },
                },
            ]);
            if (!post)
                return res.status(404).json({ msg: "Post not found." });
            res.status(200).json({
                msg: "Updated posts.",
                post,
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getLikePost(req, res) {
        try {
            const post = await postModel_1.default.findById(req.params.postId)
                .populate({
                path: "likes",
                select: "_id avatar username fullname followers following",
                populate: {
                    path: "followers following",
                    select: "_id avatar username fullname",
                },
            })
                .sort("-createdAt");
            res.status(200).json(post?.likes);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async likePost(req, res) {
        try {
            const post = await postModel_1.default.find({
                _id: req.params.postId,
                likes: req.user?._id,
            });
            if (post.length > 0)
                return res.status(400).json({ msg: "You liked this post." });
            const like = await postModel_1.default.findByIdAndUpdate(req.params.postId, { $push: { likes: req.user?._id } }, { new: true });
            if (!like)
                return res.status(400).json({
                    msg: "This post does not exist.",
                });
            res.status(200).json({
                msg: "Liked posts.",
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async unLikePost(req, res) {
        try {
            const unlike = await postModel_1.default.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.user?._id } }, { new: true });
            if (!unlike)
                return res.status(400).json({ msg: "This post does not exist." });
            res.status(200).json({
                msg: "unLiked posts.",
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getUserPosts(req, res) {
        try {
            const features = new APIfeatures(postModel_1.default.find({ user: req.params.userId }), req.query).paginating();
            const posts = await features.query.sort("-createdAt");
            res.status(200).json({ posts, results: Number(posts?.length) });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getPost(req, res) {
        try {
            const post = await postModel_1.default.findById(req.params.postId).populate([
                { path: "user", select: "_id avatar username fullname followers" },
                {
                    path: "comments",
                    populate: {
                        path: "user likes",
                        select: "_id avatar username fullname",
                    },
                },
            ]);
            res.status(200).json({ post });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getPostsExplore(req, res) {
        try {
            const newArr = [...req.user?.following, req.user?._id];
            const num = req.query.num || 3;
            const posts = await postModel_1.default.aggregate([
                { $match: { user: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
            ]);
            res.status(200).json({
                msg: "Get posts successfully.",
                result: posts.length,
                posts,
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deletePost(req, res) {
        try {
            const post = await postModel_1.default.findOneAndDelete({
                _id: req.params.postId,
                user: req.user?._id,
            });
            if (!post)
                return res.status(400).json({ msg: "This post does not exist" });
            await commentModel_1.default.deleteMany({ _id: { $in: post.comments } });
            res.status(200).json({
                msg: "Deleted post",
                newPost: { ...post._doc, user: req.user },
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async savePost(req, res) {
        try {
            const user = await userModel_1.default.findOne({
                _id: req.user?._id,
                saved: req.params.postId,
            });
            if (user)
                return res.status(400).json({ msg: "You saved this post." });
            const save = await userModel_1.default.findByIdAndUpdate(req.user?._id, { $push: { saved: req.params.postId } }, { new: true });
            if (!save)
                res.status(400).json({ msg: "This post does not exist." });
            res.status(200).json({ msg: "Saved post." });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async unSavePost(req, res) {
        try {
            const unSave = await userModel_1.default.findByIdAndUpdate(req.user?._id, { $pull: { saved: req.params.postId } }, { new: true });
            if (!unSave)
                res.status(400).json({ msg: "This post does not exist." });
            res.status(200).json({ msg: "Un-saved post." });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getSavePosts(req, res) {
        try {
            const features = new APIfeatures(postModel_1.default.find({ _id: { $in: req.user?.saved } }), req.query).paginating();
            const posts = await features.query.sort("-createdAt");
            res.status(200).json({ posts, result: posts.length });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
}
exports.default = new postCtrl();

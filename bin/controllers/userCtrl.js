"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/userModel"));
class userCtrl {
    async searchUser(req, res) {
        try {
            const users = await userModel_1.default.find({
                username: { $regex: `${req.query.username}`, $options: "i" },
            })
                .limit(10)
                .select("_id fullname username avatar");
            res.json({ users });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async addHistorySearch(req, res) {
        try {
            const userId = req.params.userId;
            const user = await userModel_1.default.findOne({
                _id: req.user?._id,
                historySearch: userId,
            });
            if (!user) {
                const update = await userModel_1.default.findByIdAndUpdate(req.user?._id, { $push: { historySearch: userId } }, { new: true });
                return res.status(200).json({
                    msg: "Add user search to list user search successfully.",
                });
            }
            else {
                return res.status(200).json({
                    msg: "Add user search to list user search successfully.",
                });
            }
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getHistorySearch(req, res) {
        try {
            const list = await userModel_1.default.findById(req.user?._id)
                .select("historySearch")
                .populate("historySearch", "_id fullname username avatar");
            res.status(200).json(list?.historySearch);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteHistorySearchByUserId(req, res) {
        try {
            const userId = req.params.userId;
            const user = await userModel_1.default.findOne({
                _id: req.user?._id,
                historySearch: userId,
            });
            if (user) {
                const update = await userModel_1.default.findByIdAndUpdate(req.user?._id, { $pull: { historySearch: userId } }, { new: true });
                return res.status(200).json({
                    msg: "Remove user by id from list user search successfully.",
                });
            }
            else {
                return res.status(200).json({
                    msg: "Remove user by id from list user search successfully.",
                });
            }
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteAllHistorySearch(req, res) {
        try {
            const update = await userModel_1.default.findByIdAndUpdate(req.user?._id, { historySearch: [] }, { new: true });
            res.status(200).json({ msg: "History search cleared successfully." });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getUserById(req, res) {
        try {
            const userId = req.params.userId;
            const user = await userModel_1.default.findById(userId).populate({
                path: "followers following",
                select: "avatar username fullname followers following",
            });
            if (!user)
                return res.status(400).json({ msg: "User not found" });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getFollowersByUserId(req, res) {
        try {
            const userId = req.params.userId;
            const user = await userModel_1.default.findById(userId).populate({
                path: "followers",
                select: "avatar username fullname",
            });
            if (!user)
                return res.status(400).json({ msg: "User not found" });
            res.status(200).json(user.followers);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getFollowingByUserId(req, res) {
        try {
            const userId = req.params.userId;
            const user = await userModel_1.default.findById(userId).populate({
                path: "following",
                select: "avatar username fullname",
            });
            if (!user)
                return res.status(400).json({ msg: "User not found" });
            res.status(200).json(user.following);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async updateProfile(req, res) {
        try {
            const { username, fullname, avatar, gender, bio, website } = (req.body);
            const updateProfile = await userModel_1.default.findByIdAndUpdate(req.user?._id, {
                username,
                fullname,
                avatar,
                gender,
                bio,
                website,
            }, { new: true });
            res.status(200).json({
                msg: "Updated profile successfully",
                user: updateProfile,
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async updatePassword(req, res) {
        try {
            const { password, oldPassword } = req.body;
            const user = await userModel_1.default.findById(req.user?._id).select("+password");
            if (!user)
                return res.status(400).json({ msg: "User not found with email." });
            const isMatchedPassword = await bcrypt_1.default.compare(oldPassword, user.password);
            if (!isMatchedPassword)
                return res.status(400).json({ msg: "Invalid old password" });
            const hashPassword = await bcrypt_1.default.hash(password, 12);
            await userModel_1.default.findByIdAndUpdate(req.user?._id, { password: hashPassword, refreshToken: "" }, { new: true });
            res.clearCookie("refreshToken");
            res.status(200).json({
                msg: "Updated password successfully",
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async follow(req, res) {
        try {
            const user = await userModel_1.default.find({
                _id: req.params.id,
                followers: req.user?._id,
            });
            if (user.length > 0)
                return res.status(500).json({ msg: "You followed this user." });
            const newUser = await userModel_1.default.findByIdAndUpdate(req.params.id, { $push: { followers: req.user?._id } }, { new: true }).populate("followers following");
            await userModel_1.default.findByIdAndUpdate(req.user?._id, { $push: { following: req.params.id } }, { new: true });
            return res.status(200).json({ msg: "Followed user.", newUser });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async unfollow(req, res) {
        try {
            const newUser = await userModel_1.default.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user?._id } }, { new: true }).populate("followers following");
            await userModel_1.default.findByIdAndUpdate(req.user?._id, { $pull: { following: req.params.id } }, { new: true });
            return res.status(200).json({ msg: "Unfollowed user.", newUser });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getSuggestionsUser(req, res) {
        try {
            const newArr = [...req.user?.following, req.user?._id];
            const num = req.query.num || 5;
            const users = await userModel_1.default.aggregate([
                { $match: { _id: { $nin: newArr } } },
                { $sample: { size: Number(num) } },
                {
                    $project: {
                        _id: 1,
                        fullname: 1,
                        username: 1,
                        avatar: 1,
                        followers: 1,
                        following: 1,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "followers",
                        foreignField: "_id",
                        as: "followers",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "following",
                        foreignField: "_id",
                        as: "following",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        fullname: 1,
                        username: 1,
                        avatar: 1,
                        followers: {
                            $map: {
                                input: "$followers",
                                as: "follower",
                                in: {
                                    _id: "$$follower._id",
                                    fullname: "$$follower.fullname",
                                    username: "$$follower.username",
                                    avatar: "$$follower.avatar",
                                },
                            },
                        },
                        following: {
                            $map: {
                                input: "$following",
                                as: "following",
                                in: {
                                    _id: "$$following._id",
                                    fullname: "$$following.fullname",
                                    username: "$$following.username",
                                    avatar: "$$following.avatar",
                                },
                            },
                        },
                    },
                },
            ]);
            res.status(200).json({ users, result: users.length });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
}
exports.default = new userCtrl();

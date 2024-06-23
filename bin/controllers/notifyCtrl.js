"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notifyModel_1 = __importDefault(require("../models/notifyModel"));
class notifyCtrl {
    async create(req, res) {
        try {
            const { id, recipients, url, text, content, image } = req.body;
            if (recipients.includes(req.user?._id.toString()))
                return;
            const newNotify = new notifyModel_1.default({
                id,
                recipients,
                url,
                text,
                content,
                image,
                user: req.user?._id,
            });
            await newNotify.save();
            res.status(200).json({ msg: "Creat a new notify", newNotify });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async remove(req, res) {
        try {
            await notifyModel_1.default.findOneAndDelete({
                id: req.params.id,
                url: String(req.query.url),
            });
            res.status(200).json({ msg: "Removed notify" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getNotifies(req, res) {
        try {
            const notifies = await notifyModel_1.default.find({ recipients: req.user?._id })
                .sort("-createdAt")
                .populate("user", "avatar username");
            res.status(200).json({ msg: "Get notifies", notifies });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async readNotify(req, res) {
        try {
            const check = await notifyModel_1.default.findOne({
                _id: req.params.notifyId,
                recipients: req.user?._id,
            });
            if (!check)
                return res.status(400).json({ msg: "Something is wrong'" });
            const checkIsReaded = await notifyModel_1.default.findOne({
                _id: req.params.notifyId,
                isUserReaded: req.user?._id,
            });
            if (checkIsReaded)
                return res.status(200).json({
                    msg: "Read notify",
                    readNotify: checkIsReaded,
                });
            const readNotify = await notifyModel_1.default.findByIdAndUpdate(req.params.notifyId, { $push: { isUserReaded: req.user?._id } }, { new: true });
            res.status(200).json({ msg: "Read notify", readNotify });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteANotify(req, res) {
        try {
            const notify = await notifyModel_1.default.findOneAndUpdate({ _id: req.params.notifyId }, { $pull: { recipients: req.user?._id } }, { new: true });
            if (!notify)
                return res.status(400).json({ msg: "Something is wrong'" });
            if (notify.recipients.length === 0) {
                await notifyModel_1.default.findByIdAndDelete(req.params.notifyId);
            }
            res.status(200).json({ msg: "Delete a notify", notify });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteAllNotify(req, res) {
        try {
            await notifyModel_1.default.updateMany({}, { $pull: { recipients: req.user?._id } });
            res.status(200).json({ msg: "Delete all notify" });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
}
exports.default = new notifyCtrl();

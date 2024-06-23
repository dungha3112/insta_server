"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversationModel_1 = __importDefault(require("../models/conversationModel"));
const messageModel_1 = __importDefault(require("../models/messageModel"));
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
class messageCtrl {
    async createMessage(req, res) {
        try {
            const { sender, call, recipient, text, media } = req.body;
            if (!recipient || (!text.trim() && media.length === 0 && !call))
                return;
            const newConversation = (await conversationModel_1.default.findOneAndUpdate({
                $or: [
                    { recipients: [String(sender), String(recipient)] },
                    { recipients: [String(recipient), String(sender)] },
                ],
            }, {
                recipients: [String(sender), String(recipient)],
                text,
                media,
                call,
                isRead: true,
            }, { new: true, upsert: true }));
            const newMessage = new messageModel_1.default({
                conversation: newConversation,
                sender,
                recipient,
                text,
                media,
                call,
            });
            await newMessage.save();
            res.status(200).json({
                msg: "Create a new conversation",
                newMessage,
            });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getConversations(req, res) {
        try {
            const features = new APIfeatures(conversationModel_1.default.find({
                recipients: req.user?._id,
            }), req.query).paginating();
            const conversations = await features.query
                .sort("-updatedAt")
                .populate("recipients", "avatar username fullname");
            res.status(200).json({ conversations, result: conversations.length });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async getMessages(req, res) {
        try {
            const features = new APIfeatures(messageModel_1.default.find({
                $or: [
                    {
                        sender: String(req.user?._id),
                        recipient: String(req.params.userId),
                    },
                    {
                        sender: String(req.params.userId),
                        recipient: String(req.user?._id),
                    },
                ],
            }), req.query).paginating();
            const messages = await features.query.sort("-createdAt");
            res.status(200).json({ messages, result: messages.length });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteMessage(req, res) {
        try {
            await messageModel_1.default.findOneAndDelete({
                _id: req.params.msgId,
                sender: req.user?._id,
            });
            res.status(200).json({ msg: "Deleted messages." });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
    async deleteConversation(req, res) {
        try {
            const newConver = await conversationModel_1.default.findOneAndDelete({
                $or: [
                    { recipients: [req.user?._id, req.params.userId] },
                    { recipients: [req.params.userId, req.user?._id] },
                ],
            });
            await messageModel_1.default.deleteMany({ conversation: newConver?._id });
            res.status(200).json({ msg: "Delete success." });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
}
exports.default = new messageCtrl();

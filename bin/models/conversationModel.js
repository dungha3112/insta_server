"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    recipients: [{ type: mongoose_1.default.Types.ObjectId, ref: "User", default: [] }],
    text: String,
    media: Array,
    call: Object,
    isRead: { type: Boolean, default: true },
}, { timestamps: true });
const ConversationModel = mongoose_1.default.model("Conversation", conversationSchema);
exports.default = ConversationModel;

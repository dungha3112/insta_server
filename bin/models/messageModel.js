"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    conversation: { type: mongoose_1.default.Types.ObjectId, ref: "Conversation" },
    sender: { type: mongoose_1.default.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose_1.default.Types.ObjectId, ref: "User" },
    text: String,
    media: Array,
    call: Object,
}, {
    timestamps: true,
});
const MessagesModel = mongoose_1.default.model("Message", messageSchema);
exports.default = MessagesModel;

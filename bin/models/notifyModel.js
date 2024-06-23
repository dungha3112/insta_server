"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notifySchema = new mongoose_1.default.Schema({
    id: String,
    user: { type: mongoose_1.default.Types.ObjectId, ref: "User" },
    recipients: [{ type: String, default: [] }],
    url: String,
    text: String,
    content: String,
    image: String,
    isUserReaded: [{ type: String, default: [] }],
}, {
    timestamps: true,
});
const NotifyModel = mongoose_1.default.model("Notify", notifySchema);
exports.default = NotifyModel;

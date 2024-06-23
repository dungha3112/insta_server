"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const messageCtrl_1 = __importDefault(require("../controllers/messageCtrl"));
const router = (0, express_1.Router)();
router.post("/message", auth_1.default, messageCtrl_1.default.createMessage);
router.get("/conversations", auth_1.default, messageCtrl_1.default.getConversations);
router.delete("/conversation/:userId", auth_1.default, messageCtrl_1.default.deleteConversation);
router.get("/message/:userId", auth_1.default, messageCtrl_1.default.getMessages);
router.delete("/message/:msgId", auth_1.default, messageCtrl_1.default.deleteMessage);
exports.default = router;

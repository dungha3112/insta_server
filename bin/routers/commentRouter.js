"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const commentCtrl_1 = __importDefault(require("../controllers/commentCtrl"));
const router = (0, express_1.Router)();
router.post("/", auth_1.default, commentCtrl_1.default.createComment);
router.patch("/:commentId", auth_1.default, commentCtrl_1.default.updateComment);
router.get("/getlikes/:commentId", auth_1.default, commentCtrl_1.default.getCommentLike);
router.delete("/:commentId", auth_1.default, commentCtrl_1.default.deleteComment);
router.patch("/:commentId/like", auth_1.default, commentCtrl_1.default.likeComment);
router.patch("/:commentId/unlike", auth_1.default, commentCtrl_1.default.unLikeComment);
exports.default = router;

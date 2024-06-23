"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const postCtrl_1 = __importDefault(require("../controllers/postCtrl"));
const router = (0, express_1.Router)();
router
    .route("/posts")
    .post(auth_1.default, postCtrl_1.default.createPost)
    .get(auth_1.default, postCtrl_1.default.getPosts);
router.get("/post/explore_posts", auth_1.default, postCtrl_1.default.getPostsExplore);
router.get("/post/save_posts", auth_1.default, postCtrl_1.default.getSavePosts);
router
    .route("/post/:postId")
    .patch(auth_1.default, postCtrl_1.default.updatePost)
    .get(auth_1.default, postCtrl_1.default.getPost)
    .delete(auth_1.default, postCtrl_1.default.deletePost);
router.route("/post/:postId/save").patch(auth_1.default, postCtrl_1.default.savePost);
router.route("/post/:postId/unsave").patch(auth_1.default, postCtrl_1.default.unSavePost);
router
    .route("/post/:postId/like")
    .get(auth_1.default, postCtrl_1.default.getLikePost)
    .patch(auth_1.default, postCtrl_1.default.likePost);
router.route("/post/:postId/unlike").patch(auth_1.default, postCtrl_1.default.unLikePost);
router.get("/post/user_posts/:userId", auth_1.default, postCtrl_1.default.getUserPosts);
exports.default = router;

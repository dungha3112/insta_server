import { Router } from "express";
import auth from "../middlewares/auth";
import postCtrl from "../controllers/postCtrl";

const router = Router();

router
  .route("/posts")
  .post(auth, postCtrl.createPost)
  .get(auth, postCtrl.getPosts);

router.get("/post/explore_posts", auth, postCtrl.getPostsExplore);
router.get("/post/save_posts", auth, postCtrl.getSavePosts);

router
  .route("/post/:postId")
  .patch(auth, postCtrl.updatePost)
  .get(auth, postCtrl.getPost)
  .delete(auth, postCtrl.deletePost);

router.route("/post/:postId/save").patch(auth, postCtrl.savePost);
router.route("/post/:postId/unsave").patch(auth, postCtrl.unSavePost);

router
  .route("/post/:postId/like")
  .get(auth, postCtrl.getLikePost)
  .patch(auth, postCtrl.likePost);

router.route("/post/:postId/unlike").patch(auth, postCtrl.unLikePost);

router.get("/post/user_posts/:userId", auth, postCtrl.getUserPosts);

export default router;

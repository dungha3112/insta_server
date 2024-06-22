import { Router } from "express";
import auth from "../middlewares/auth";
import commentCtrl from "../controllers/commentCtrl";

const router = Router();

router.post("/", auth, commentCtrl.createComment);
router.patch("/:commentId", auth, commentCtrl.updateComment);

router.get("/getlikes/:commentId", auth, commentCtrl.getCommentLike);

router.delete("/:commentId", auth, commentCtrl.deleteComment);

router.patch("/:commentId/like", auth, commentCtrl.likeComment);
router.patch("/:commentId/unlike", auth, commentCtrl.unLikeComment);

export default router;

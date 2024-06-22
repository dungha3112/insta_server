import { Router } from "express";
import auth from "../middlewares/auth";
import userCtrl from "../controllers/userCtrl";

const router = Router();

router.get("/search", auth, userCtrl.searchUser);
router.get("/suggestions", auth, userCtrl.getSuggestionsUser);

router.put("/add-history-search/:userId", auth, userCtrl.addHistorySearch);
router.put(
  "/history-delete/:userId",
  auth,
  userCtrl.deleteHistorySearchByUserId
);

router.get("/:userId/followers", auth, userCtrl.getFollowersByUserId);
router.get("/:userId/following", auth, userCtrl.getFollowingByUserId);

router.patch("/:id/follow", auth, userCtrl.follow);
router.patch("/:id/unfollow", auth, userCtrl.unfollow);

router.get("/history-search", auth, userCtrl.getHistorySearch);
router.delete("/history-search", auth, userCtrl.deleteAllHistorySearch);
router.get("/:userId", auth, userCtrl.getUserById);
router.put("/update-profile", auth, userCtrl.updateProfile);
router.put("/update-password", auth, userCtrl.updatePassword);

export default router;

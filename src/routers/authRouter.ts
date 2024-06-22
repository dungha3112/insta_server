import { Router } from "express";
import authCtrl from "../controllers/authCtrl";
import auth from "../middlewares/auth";

const router = Router();
router.post("/signup", authCtrl.signup);
router.post("/signin", authCtrl.signin);

router.get("/refresh_token", authCtrl.refreshToken);
router.post("/logout", auth, authCtrl.logout);

export default router;

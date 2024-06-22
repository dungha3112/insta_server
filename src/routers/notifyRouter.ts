import { Router } from "express";
import auth from "../middlewares/auth";
import notifyCtrl from "../controllers/notifyCtrl";

const router = Router();

router.post("/notify", auth, notifyCtrl.create);
router.get("/notifies", auth, notifyCtrl.getNotifies);
router.delete("/notifies", auth, notifyCtrl.deleteAllNotify);

router.delete("/notify/:id", auth, notifyCtrl.remove);
router.patch("/notify/read/:notifyId", auth, notifyCtrl.readNotify);
router.patch("/notify/delete/:notifyId", auth, notifyCtrl.deleteANotify);

export default router;

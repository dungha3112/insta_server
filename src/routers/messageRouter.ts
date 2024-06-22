import { Router } from "express";
import auth from "../middlewares/auth";
import messageCtrl from "../controllers/messageCtrl";

const router = Router();

router.post("/message", auth, messageCtrl.createMessage);

router.get("/conversations", auth, messageCtrl.getConversations);
router.delete("/conversation/:userId", auth, messageCtrl.deleteConversation);

router.get("/message/:userId", auth, messageCtrl.getMessages);

router.delete("/message/:msgId", auth, messageCtrl.deleteMessage);

export default router;

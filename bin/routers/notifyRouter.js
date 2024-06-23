"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middlewares/auth"));
const notifyCtrl_1 = __importDefault(require("../controllers/notifyCtrl"));
const router = (0, express_1.Router)();
router.post("/notify", auth_1.default, notifyCtrl_1.default.create);
router.get("/notifies", auth_1.default, notifyCtrl_1.default.getNotifies);
router.delete("/notifies", auth_1.default, notifyCtrl_1.default.deleteAllNotify);
router.delete("/notify/:id", auth_1.default, notifyCtrl_1.default.remove);
router.patch("/notify/read/:notifyId", auth_1.default, notifyCtrl_1.default.readNotify);
router.patch("/notify/delete/:notifyId", auth_1.default, notifyCtrl_1.default.deleteANotify);
exports.default = router;

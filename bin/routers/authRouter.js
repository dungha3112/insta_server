"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authCtrl_1 = __importDefault(require("../controllers/authCtrl"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.post("/signup", authCtrl_1.default.signup);
router.post("/signin", authCtrl_1.default.signin);
router.get("/refresh_token", authCtrl_1.default.refreshToken);
router.post("/logout", auth_1.default, authCtrl_1.default.logout);
exports.default = router;

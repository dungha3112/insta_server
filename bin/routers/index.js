"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authRouter_1 = __importDefault(require("./authRouter"));
const userRouter_1 = __importDefault(require("./userRouter"));
const postRouter_1 = __importDefault(require("./postRouter"));
const commentRouter_1 = __importDefault(require("./commentRouter"));
const notifyRouter_1 = __importDefault(require("./notifyRouter"));
const messageRouter_1 = __importDefault(require("./messageRouter"));
const routes = {
    authRouter: authRouter_1.default,
    userRouter: userRouter_1.default,
    postRouter: postRouter_1.default,
    commentRouter: commentRouter_1.default,
    notifyRouter: notifyRouter_1.default,
    messageRouter: messageRouter_1.default,
};
exports.default = routes;

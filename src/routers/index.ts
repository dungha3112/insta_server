import authRouter from "./authRouter";
import userRouter from "./userRouter";
import postRouter from "./postRouter";
import commentRouter from "./commentRouter";
import notifyRouter from "./notifyRouter";
import messageRouter from "./messageRouter";

const routes = {
  authRouter: authRouter,
  userRouter: userRouter,
  postRouter: postRouter,
  commentRouter: commentRouter,
  notifyRouter: notifyRouter,
  messageRouter: messageRouter,
};

export default routes;

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Response } from "express";
import morgan from "morgan";
import ConnectDB from "./configs/connectBD";
import routes from "./routers";

import { PeerServer } from "peer";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://insta-client-6v4r.onrender.com",
      "https://insta-client-six.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "DELETE", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use((req: IReqAuth, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
// socket
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import SocketServer from "./socketServer";
import { IReqAuth } from "./configs/interfaces";
const http = createServer(app);

const io = new Server(http, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://insta-client-6v4r.onrender.com",
      "https://insta-client-six.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "DELETE", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
ConnectDB();

io.on("connection", (socket: Socket) => {
  SocketServer(socket);
});

// Create Peer Server
PeerServer({ port: 3001, path: "/" });

app.use("/api/auth", routes.authRouter);
app.use("/api/user", routes.userRouter);
app.use("/api", routes.postRouter);
app.use("/api/comment", routes.commentRouter);
app.use("/api", routes.notifyRouter);
app.use("/api", routes.messageRouter);

const PORT = process.env.PORT;
http.listen(PORT, () => {
  console.log(`-->Server running on port: ${PORT}`);
});

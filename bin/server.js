"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const connectBD_1 = __importDefault(require("./configs/connectBD"));
const routers_1 = __importDefault(require("./routers"));
const peer_1 = require("peer");
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://insta-client-6v4r.onrender.com",
        "https://insta-client-6v4r.onrender.com/",
    ],
    credentials: true,
    methods: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, cookie_parser_1.default)());
// socket
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socketServer_1 = __importDefault(require("./socketServer"));
const http = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(http, {
    cors: {
        origin: [
            "http://localhost:3000",
            "https://insta-client-6v4r.onrender.com",
            "https://insta-client-6v4r.onrender.com/",
        ],
        credentials: true,
        methods: "*",
        allowedHeaders: ["Content-Type", "Authorization"],
    },
});
(0, connectBD_1.default)();
io.on("connection", (socket) => {
    (0, socketServer_1.default)(socket);
});
// Create Peer Server
(0, peer_1.PeerServer)({ port: 3001, path: "/" });
app.use("/api/auth", routers_1.default.authRouter);
app.use("/api/user", routers_1.default.userRouter);
app.use("/api", routers_1.default.postRouter);
app.use("/api/comment", routers_1.default.commentRouter);
app.use("/api", routers_1.default.notifyRouter);
app.use("/api", routers_1.default.messageRouter);
const PORT = process.env.PORT;
http.listen(PORT, () => {
    console.log(`-->Server running on port: ${PORT}`);
});

import { Socket } from "socket.io";
import { IPost, ISocket, IUser } from "./configs/interfaces";

let users: ISocket[] = [];

const EditData = (data: any, id: any, call: any) => {
  const newData = data.map((item: any) =>
    item.id === id ? { ...item, call } : item
  );
  return newData;
};

const SocketServer = (socket: Socket) => {
  // joinUser
  socket.on("joinUser", (user: IUser) => {
    users.push({
      id: user._id,
      socketId: socket.id,
      followers: user.followers,
      call: null,
    });
  });

  // disconnect
  socket.on("disconnect", () => {
    const data = users.find((user) => user.socketId === socket.id);

    if (data) {
      const clients = users.filter((user) =>
        data.followers.find((item) => item._id === user.id)
      );

      if (clients.length > 0) {
        clients.forEach((client) => {
          socket.to(`${client.socketId}`).emit("checkUserOffline", data.id);
        });
      }
      if (data.call) {
        const callUser = users.find((user) => user.id === data.call);
        if (callUser) {
          users = EditData(users, callUser.id, null);
          socket.to(`${callUser.socketId}`).emit("callerDisconnect");
        }
      }
    }
    users = users.filter((item) => item.socketId !== socket.id);
  });

  // likePost
  socket.on("likePost", (newPost: IPost) => {
    const ids = [...newPost.user.followers, newPost.user._id];

    const clients = users.filter((user: ISocket) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("likeToClient", newPost);
      });
    }
  });

  // unLikePost
  socket.on("unLikePost", (newPost: IPost) => {
    const ids = [...newPost.user.followers, newPost.user._id];

    const clients = users.filter((user: ISocket) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("unLikeToClient", newPost);
      });
    }
  });

  // createComment
  socket.on("createComment", (newPost: IPost) => {
    const ids = [...newPost.user.followers, newPost.user._id];

    const clients = users.filter((user: ISocket) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("createCommentToClient", newPost);
      });
    }
  });

  // deleteComment
  socket.on("deleteComment", (newPost: IPost) => {
    const ids = [...newPost.user.followers, newPost.user._id];

    const clients = users.filter((user: ISocket) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("deleteCommentToClient", newPost);
      });
    }
  });

  // likeComment
  socket.on("likeComment", (newPost: IPost) => {
    const ids = [...newPost.user.followers, newPost.user._id];

    const clients = users.filter((user: ISocket) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("likeCommentToClient", newPost);
      });
    }
  });

  // unLikeComment
  socket.on("unLikeComment", (newPost: IPost) => {
    const ids = [...newPost.user.followers, newPost.user._id];

    const clients = users.filter((user: ISocket) => ids.includes(user.id));
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("unLikeCommentToClient", newPost);
      });
    }
  });

  // follow
  socket.on("follow", (newUser: IUser) => {
    const user = users.find((item: ISocket) => item.id === newUser._id);
    user && socket.to(`${user.socketId}`).emit("followToClient", newUser);
  });

  // unFollow
  socket.on("unFollow", (newUser: IUser) => {
    const user = users.find((item: ISocket) => item.id === newUser._id);
    user && socket.to(`${user.socketId}`).emit("unFollowToClient", newUser);
  });

  // createNotify
  socket.on("createNotify", (msg) => {
    const clients = users.filter((user: ISocket) =>
      msg.recipients.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("createNotifyToClient", msg);
      });
    }
  });

  // removeNotify
  socket.on("removeNotify", (msg) => {
    const clients = users.filter((user: ISocket) =>
      msg.recipients.includes(user.id)
    );
    if (clients.length > 0) {
      clients.forEach((client: ISocket) => {
        socket.to(`${client.socketId}`).emit("removeNotifyToClient", msg);
      });
    }
  });

  // addMessage
  socket.on("addMessage", (msg) => {
    const user = users.find((user) => user.id === msg.recipient);
    user && socket.to(`${user.socketId}`).emit("addMessageToClient", msg);
  });

  // deleteMessage
  socket.on("deleteMessage", (data) => {
    const user = users.find((user) => user.id === data._id);
    user && socket.to(`${user.socketId}`).emit("deleteMessageToClient", data);
  });

  // Check User Online / Offline
  socket.on("checkUserOnline", (data) => {
    const following = users.filter((user) =>
      data.following.find((item: IUser) => item._id === user.id)
    );

    socket.emit("checkUserOnlineToMe", following);

    const clients = users.filter((user) =>
      data.followers.find((item: IUser) => item._id === user.id)
    );

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketId}`)
          .emit("checkUserOnlineToClient", data._id);
      });
    }
  });

  // Call
  socket.on("callUser", (data) => {
    console.log(data);

    users = EditData(users, data.sender, data.recipient);
    const client = users.find((user) => user.id === data.recipient);

    if (client) {
      if (client.call) {
        socket.emit("userBusy", data);
        users = EditData(users, data.sender, null);
      } else {
        users = EditData(users, data.recipient, data.sender);
        socket.to(`${client.socketId}`).emit("callUserToClient", data);
      }
    }
  });

  // end call
  socket.on("endCall", (data) => {
    const client = users.find((user) => user.id === data.sender);

    if (client) {
      socket.to(`${client.socketId}`).emit("endCallToClient", data);
      users = EditData(users, client.id, null);

      if (client.call) {
        const clientCall = users.find((user) => user.id === client.call);
        clientCall &&
          socket.to(`${clientCall.socketId}`).emit("endCallToClient", data);

        users = EditData(users, client.call, null);
      }
    }
  });
};

export default SocketServer;

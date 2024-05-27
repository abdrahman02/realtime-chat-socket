import { Server } from "socket.io";

const io = new Server({
  cors: "http://localhost:5173",
});

let onlineUser = [];

io.on("connection", (socket) => {
  console.log("New Connection", socket.id);

  //   Listen to a connection
  socket.on("addNewUser", (userId) => {
    !onlineUser.some((user) => user.userId === userId) &&
      onlineUser.push({ userId, socketId: socket.id });

    console.log("onlineUser", onlineUser);

    io.emit("getOnlineUser", onlineUser);
  });

  // add message
  socket.on("sendMessage", (message) => {
    const user = onlineUser.find((user) => user.userId === message.recipientId);
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  // user disconnect
  socket.on("disconnect", () => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socket.id);

    io.emit("getOnlineUser", onlineUser);
  });
});

io.listen(3000);

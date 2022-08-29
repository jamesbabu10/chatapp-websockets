const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  adduser,
  removeuser,
  getuser,
  getusersinroom,
} = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const {
  generatemessage,
  generatelocationmessage,
} = require("./utils/messages");
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Websocket Connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = adduser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generatemessage("Admin", "welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generatemessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomdata", {
      room: user.room,
      users: getusersinroom(user.room),
    });
    callback();
  });

  socket.on("sendmessage", (msg, callback) => {
    const user = getuser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generatemessage(user.username, msg));
    callback();
  });

  socket.on("sendlocation", (location, callback) => {
    const user = getuser(socket.id);
    io.to(user.room).emit(
      "locationmessage",
      generatelocationmessage(
        user.username,
        `https://google.com/maps?q=lat${location.latitude},long ${location.longitude} `
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeuser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generatemessage("Admin", `${user.username} has disconnected`)
      );
      io.to(user.room).emit("roomdata", {
        room: user.room,
        users: getusersinroom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("server is up on port" + port);
});

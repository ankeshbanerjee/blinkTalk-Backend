import app from "./app.js";
import connectToDb from "./utils/connect.db.js";
import http from "http";
import { Server } from "socket.io";

connectToDb();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("user connected with socket " + socket.id);

  // join a room
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log("user joined in the room: " + roomId);
  });

  // send message in the room
  socket.on("message", (message) => {
    let parsedMessage = JSON.parse(message);
    // broadcasting message to all clients in parsedMessage.chat._id room
    io.to(parsedMessage.chat._id).emit("message", message);
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT, () => {
  console.log("server is listening on port " + process.env.PORT);
});

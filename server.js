import express from "express";
import http from "http"
import { Server } from "socket.io";
import ACTIONS from "./lib/action.js";

const app = express()
app.use(express.json())
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const userSocketMap = {};

async function getAllConnectedClients(roomID) {
  const sockets = await io.in(roomID).fetchSockets();
  return sockets.map((socket) => ({
    socketID: socket.id,
    username: userSocketMap[socket.id],
  }));
}

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, async ({ roomID, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomID);

    const clients = await getAllConnectedClients(roomID);

    console.log("clients", clients);

    // Notify all clients (including new one) that someone joined
    clients.forEach(({ socketID }) => {
      io.to(socketID).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketID: socket.id,
      });
    });

    // Ask existing users (except the new one) to sync code with the new user
    socket.in(roomID).emit(ACTIONS.SYNC_CODE, { socketID: socket.id });
  });

  // Code change broadcast
  socket.on(ACTIONS.CODE_CHANGE, ({ roomID, code }) => {
    socket.in(roomID).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle direct sync from one client to another
  socket.on(ACTIONS.SYNC_CODE, ({ socketID, code }) => {
    io.to(socketID).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle disconnects
  socket.on(ACTIONS.DISCONNECTING, async () => {
    const rooms = [...socket.rooms];

    rooms.forEach(async (roomID) => {
      socket.in(roomID).emit(ACTIONS.DISCONNECTED, {
        socketID: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});



const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
})

app.get("/", (req, res) => {
  res.send("CodeSync Socket Server is running");
});
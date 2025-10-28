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















// import { WebSocketServer, WebSocket } from "ws";
// import { dbAction } from "./appwrite/action"; // no .ts extension
// import dotenv from "dotenv";
// dotenv.config();

// const PORT = parseInt(process.env.PORT || "9090", 10);
// const wss = new WebSocketServer({ port: PORT });

// interface ExtWebSocket extends WebSocket {
//   isAlive?: boolean;
//   projectID?: string;
// }

// wss.on("connection", async (ws: ExtWebSocket, req) => {
//   const url = req?.url ? new URL(req.url, `http://${req.headers.host}`) : null;
//   const projectID = url?.searchParams.get("project");

//   if (!projectID) {
//     ws.close();
//     return;
//   }

//   ws.projectID = projectID;
//   ws.isAlive = true;

//   // Send current content to new client
//   try {
//     const doc = (await dbAction("get", null, projectID)) as { content?: string } | null;
//     if (doc?.content) ws.send(JSON.stringify({ type: "update", content: doc.content }));
//   } catch (err) {
//     console.error(err);
//   }

//   // Handle pong replies
//   ws.on("pong", () => {
//     ws.isAlive = true;
//   });

//   ws.on("message", async (rawMsg) => {
//     try {
//       const data = JSON.parse(rawMsg.toString());
//       if (data.type === "update") {
//         const currentDoc = (await dbAction("get", null, projectID)) as { content?: string } | null;
//         if (currentDoc?.content === data.content) return;

//         await dbAction("update", { content: data.content }, projectID);

//         // Broadcast to all other clients of the same project
//         wss.clients.forEach((client) => {
//           const ext = client as ExtWebSocket;
//           if (ext.readyState === WebSocket.OPEN && ext.projectID === projectID && ext !== ws) {
//             ext.send(JSON.stringify({ type: "update", content: data.content }));
//           }
//         });
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   ws.on("close", () => console.log("Client disconnected"));
// });

// // Heartbeat every 30s
// const interval = setInterval(() => {
//   wss.clients.forEach((ws) => {
//     const ext = ws as ExtWebSocket;
//     if (!ext.isAlive) return ext.terminate();
//     ext.isAlive = false;
//     ext.ping();
//   });
// }, 30000);

// wss.on("close", () => clearInterval(interval));

// console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);

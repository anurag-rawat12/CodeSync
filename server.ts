import { WebSocketServer } from "ws";
import db from "./appwrite/action";

const port = parseInt(process.env.PORT!, 10) || 9090;
const wss = new WebSocketServer({ port });

wss.on("connection", async (ws, req) => {
  const url = req?.url ? new URL(req.url, `http://${req.headers.host}`) : null;
  const projectID = url?.searchParams.get("project");

  if (!projectID) {
    console.error("❌ Missing project ID");
    ws.close();
    return;
  }

  try {
    const doc = await db.projects.get(projectID);
    if (doc) {
      ws.send(JSON.stringify({ type: "update", content: doc.content }));
    }
  } catch (error) {
    console.error("❌ Error fetching content:", error);
  }

  // **🔥 Keep Connection Alive** (Ping every 25s)
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, 25000);

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "update") {
        const currentDoc = await db.projects.get(projectID);
        if (currentDoc.content === data.content) return;

        await db.projects.update(projectID, { content: data.content });

        // **Broadcast Update to Other Clients**
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ type: "update", content: data.content }));
          }
        });
      }
    } catch (error) {
      console.error("❌ Error handling message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(pingInterval);
  });
});

console.log("✅ WebSocket server running on port", port);

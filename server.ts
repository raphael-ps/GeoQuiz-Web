import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Daily Challenge Seed
  app.get("/api/daily-seed", (req, res) => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    res.json({ seed });
  });

  // Multiplayer Logic
  const rooms = new Map<string, { players: any[], status: string, currentQuestion?: any }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-duel", ({ playerName, roomId: requestedRoomId }) => {
      let roomToJoin = null;

      if (requestedRoomId) {
        const room = rooms.get(requestedRoomId);
        if (room && room.players.length < 2 && room.status === "waiting") {
          roomToJoin = requestedRoomId;
        } else if (!room) {
          // Create the requested room if it doesn't exist
          const roomId = requestedRoomId;
          rooms.set(roomId, { players: [{ id: socket.id, name: playerName, score: 0 }], status: "waiting" });
          socket.join(roomId);
          socket.emit("waiting-for-opponent", { roomId });
          return;
        }
      } else {
        // Matchmaking logic
        for (const [roomId, room] of rooms.entries()) {
          if (room.players.length === 1 && room.status === "waiting" && !roomId.startsWith("private-")) {
            roomToJoin = roomId;
            break;
          }
        }
      }

      if (roomToJoin) {
        const room = rooms.get(roomToJoin)!;
        room.players.push({ id: socket.id, name: playerName, score: 0 });
        room.status = "starting";
        socket.join(roomToJoin);
        io.to(roomToJoin).emit("duel-ready", { roomId: roomToJoin, players: room.players });
      } else {
        const roomId = requestedRoomId || `room-${socket.id}`;
        rooms.set(roomId, { players: [{ id: socket.id, name: playerName, score: 0 }], status: "waiting" });
        socket.join(roomId);
        socket.emit("waiting-for-opponent", { roomId });
      }
    });

    socket.on("submit-answer", ({ roomId, isCorrect, timeSpent }) => {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player && isCorrect) {
          player.score += Math.max(1, 10 - Math.floor(timeSpent / 2));
        }
        io.to(roomId).emit("duel-update", { players: room.players });
      }
    });

    socket.on("next-round", (roomId) => {
      io.to(roomId).emit("start-next-round");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const [roomId, room] of rooms.entries()) {
        const index = room.players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit("player-left");
            room.status = "waiting";
          }
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

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
  const MAX_ROUNDS = 10;
  const rooms = new Map<string, { 
    players: any[], 
    status: string, 
    roundAnswers: Record<string, any>,
    readyForNext: string[],
    currentRound: number
  }>();

  // Global Rankings (In-memory for this session)
  let globalRankings: any[] = [];

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send current rankings on connection
    socket.emit("update-rankings", globalRankings);

    socket.on("save-ranking", (entry) => {
      globalRankings.push(entry);
      // Keep only top 100 and sort by score (desc) then time (asc)
      globalRankings.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.totalTime - b.totalTime;
      });
      globalRankings = globalRankings.slice(0, 100);
      
      // Broadcast updated rankings to all connected clients
      io.emit("update-rankings", globalRankings);
    });

    socket.on("join-duel", ({ playerName, roomId: requestedRoomId }) => {
      let roomToJoin = null;

      if (requestedRoomId) {
        const room = rooms.get(requestedRoomId);
        if (room && room.players.length < 2 && room.status === "waiting") {
          roomToJoin = requestedRoomId;
        } else if (!room) {
          // Create the requested room if it doesn't exist
          const roomId = requestedRoomId;
          rooms.set(roomId, { 
            players: [{ id: socket.id, name: playerName, score: 0 }], 
            status: "waiting",
            roundAnswers: {},
            readyForNext: [],
            currentRound: 1
          });
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
        // Pick a random country index to sync both players
        const countryIndex = Math.floor(Math.random() * 250); 
        io.to(roomToJoin).emit("duel-ready", { 
          roomId: roomToJoin, 
          players: room.players, 
          countryIndex,
          maxRounds: MAX_ROUNDS 
        });
      } else {
        const roomId = requestedRoomId || `room-${socket.id}`;
        rooms.set(roomId, { 
          players: [{ id: socket.id, name: playerName, score: 0 }], 
          status: "waiting",
          roundAnswers: {},
          readyForNext: [],
          currentRound: 1
        });
        socket.join(roomId);
        socket.emit("waiting-for-opponent", { roomId });
      }
    });

    socket.on("submit-answer", ({ roomId, isCorrect, timeSpent }) => {
      const room = rooms.get(roomId);
      if (room && !room.roundAnswers[socket.id]) {
        room.roundAnswers[socket.id] = { isCorrect, timeSpent, timestamp: Date.now() };
        
        // If both players answered
        if (Object.keys(room.roundAnswers).length === room.players.length) {
          const playerIds = Object.keys(room.roundAnswers);
          const results: any = {};
          
          // Determine who was first among correct answers
          let firstCorrectId: string | null = null;
          let earliestTimestamp = Infinity;

          playerIds.forEach(id => {
            if (room.roundAnswers[id].isCorrect && room.roundAnswers[id].timestamp < earliestTimestamp) {
              earliestTimestamp = room.roundAnswers[id].timestamp;
              firstCorrectId = id;
            }
          });

          // Calculate scores
          room.players.forEach(player => {
            const answer = room.roundAnswers[player.id];
            let points = 0;
            if (answer.isCorrect) {
              // Base points based on time
              const basePoints = Math.max(5, 10 - Math.floor(answer.timeSpent / 2));
              points = basePoints;
              
              // Bonus for being first
              if (player.id === firstCorrectId) {
                points += 5;
              }
            }
            player.score += points;
            results[player.id] = { points, isCorrect: answer.isCorrect };
          });

          io.to(roomId).emit("round-results", { results, players: room.players });
          room.roundAnswers = {}; // Reset for next round
          room.readyForNext = []; // Reset ready status
        } else {
          // Just notify that one player answered
          io.to(roomId).emit("player-answered", { playerId: socket.id });
        }
      }
    });

    socket.on("next-round", (roomId) => {
      const room = rooms.get(roomId);
      if (room && !room.readyForNext.includes(socket.id)) {
        room.readyForNext.push(socket.id);
        
        io.to(roomId).emit("next-round-status", { 
          readyCount: room.readyForNext.length, 
          totalCount: room.players.length 
        });

        if (room.readyForNext.length === room.players.length) {
          if (room.currentRound >= MAX_ROUNDS) {
            io.to(roomId).emit("duel-over", { players: room.players });
            room.status = "waiting";
            room.currentRound = 1;
            room.readyForNext = [];
          } else {
            room.currentRound++;
            const countryIndex = Math.floor(Math.random() * 250);
            io.to(roomId).emit("start-next-round", { 
              countryIndex, 
              currentRound: room.currentRound 
            });
            room.readyForNext = [];
          }
        }
      }
    });

    socket.on("leave-room", (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        const index = room.players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          socket.leave(roomId);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit("player-left");
            room.status = "waiting";
          }
        }
      }
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

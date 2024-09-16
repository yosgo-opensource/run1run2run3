import express from "express";
import { createServer as createHTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createHTTPServer(app);
const socketIO = new SocketServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "app.html"));
});

app.get("/playground", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "playground.html"));
});

const players = new Map();

socketIO.on("connection", (socket) => {
  console.log("Socket Connection...", socket.id);

  players.set(socket.id, { id: socket.id });
  socketIO.emit("playerJoined", { id: socket.id });

  socket.on("run", () => {
    socketIO.emit("run", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnect...", socket.id);
    players.delete(socket.id);
    socketIO.emit("playerLeft", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`server run on port http://localhost:${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import userRoutes from "./Routes/user.routes.js";
import chatRoutes from "./Routes/chat.routes.js";
import messageRoutes from "./Routes/message.routes.js";
import uploadFile from "./Routes/upload.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cors from "cors";

dotenv.config({
  path: "./data/config.env",
});

const app = express();
app.use(express.json()); // enables the server to accept json req.body
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Server running");
});

// user routes
app.use("/api/user", userRoutes);
// chat routes
app.use("/api/chat", chatRoutes);
// message routes
app.use("/api/message", messageRoutes);

// upload file
app.use("/api/upload", uploadFile);

// error handler
app.use(errorMiddleware);

export default app;

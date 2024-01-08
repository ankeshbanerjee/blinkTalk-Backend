import express from "express";
import {
  sendMessage,
  fetchMessages,
} from "../controllers/message.controllers.js";
import checkAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").post(checkAuth, sendMessage);
router.route("/:chatId").get(checkAuth, fetchMessages);

export default router;

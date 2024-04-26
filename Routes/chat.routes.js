import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChatById,
  fetchChats,
  removeFromGroup,
  renameGroup,
} from "../controllers/chat.controllers.js";

const router = express.Router();

router.route("/").post(checkAuth, accessChat).get(checkAuth, fetchChats);
router.route("/group").post(checkAuth, createGroupChat);
router.route("/group/rename").put(checkAuth, renameGroup);
router.route("/group/add").put(checkAuth, addToGroup);
router.route("/group/remove").put(checkAuth, removeFromGroup);
router.route("/find").get(checkAuth, fetchChatById);

export default router;

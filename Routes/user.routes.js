import express from "express";
import {
  handleLogin,
  handleRegistration,
  getUsers,
  fetchAuthenticatedUser,
  updateUserDetails,
} from "../controllers/user.controllers.js";
import checkAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(handleRegistration);
router.post("/login", handleLogin);

router.get("/me", checkAuth, fetchAuthenticatedUser);
router.patch("/update", checkAuth, updateUserDetails);

router.route("/").get(checkAuth, getUsers);

export default router;

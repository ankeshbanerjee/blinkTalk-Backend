import express from "express";
import { multerUploads } from "../middlewares/multer.middleware.js";
import cloudinaryConfig from "../middlewares/cloudinary.middleware.js";
import { uploadFileController } from "../controllers/upload.controllers.js";

const router = express.Router();

router.route("/").post(cloudinaryConfig, multerUploads, uploadFileController);

export default router;

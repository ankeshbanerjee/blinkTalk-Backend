import ErrorHandler from "../middlewares/error.middleware.js";
import { dataUri } from "../utils/datauri.js";
import { v2 as cloudinary } from "cloudinary";

const uploadFileController = async (req, res, next) => {
  try {
    if (req.file) {
      const { fileStringBlobUri, extension } = dataUri(req.file);
      const result = await cloudinary.uploader.upload(fileStringBlobUri, {
        format: extension.slice(1),
        resource_type: "auto",
      });
      const fileUrl = result.secure_url;
      res.status(200).json({
        result: {
          fileUrl,
          extension,
        },
        success: true,
        message: "file uploaded successfully",
      });
    } else {
      next(new ErrorHandler("Something went wrong while uploading file", 400));
    }
  } catch (error) {
    next(error);
  }
};

export { uploadFileController };

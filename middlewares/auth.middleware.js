import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ErrorHandler from "./error.middleware.js";

const checkAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return next(new ErrorHandler("User not authorized, no token", 401));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(
          new ErrorHandler("User not authorized, token not matched", 401)
        );
      }
      req.user = user;
      next();
    } else {
      next(
        new ErrorHandler(
          "User not authorized, token failed - no token in req.headers",
          401
        )
      );
    }
  } catch (error) {
    console.log("error in auth middleware", error);
    next(new ErrorHandler("User not authorized", 401));
  }
};

export default checkAuth;

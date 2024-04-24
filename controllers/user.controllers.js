import ErrorHandler from "../middlewares/error.middleware.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.utils.js";

const handleRegistration = async (req, res, next) => {
  try {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("Please Enter all fields", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    if (user) {
      res.status(201).json({
        result: {
          user: {
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            isAdmin: user.isAdmin,
          },
          accessToken: generateToken(user._id),
        },
        success: true,
        message: "User created successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Fill all the fields", 400));
    }
    const user = await User.findOne({ email });
    const isMatch = await user.checkPassword(password);
    if (user && isMatch) {
      return res.status(200).json({
        result: {
          user: {
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            isAdmin: user.isAdmin,
          },
          accessToken: generateToken(user._id),
        },
        success: true,
        message: "User logged in successfully",
      });
    } else {
      return next(new ErrorHandler("Invalid email or password", 400));
    }
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    if (req.query.search) {
      const users = await User.find({
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      })
        .find({ _id: { $ne: req.user._id } })
        .select("-password");
      res.status(200).json({
        result: {
          users,
        },
        success: true,
        message: "users fetched",
      });
    }
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).send({
      result: {
        users,
      },
      success: true,
      message: "users fetched",
    });
  } catch (error) {
    next(error);
  }
};

const fetchAuthenticatedUser = (req, res, next) => {
  try {
    if (req.user)
      res.status(200).json({
        result: {
          user: req.user,
        },
        success: true,
        message: "user fetched",
      });
  } catch (error) {
    next(error);
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    for (const key in updates) {
      if (Object.hasOwnProperty.call(updates, key)) {
        user[key] = updates[key];
      }
    }

    let updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).json({
      result: {
        user: updatedUser,
      },
      success: true,
      message: "User details updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  handleRegistration,
  handleLogin,
  getUsers,
  getAllUsers,
  fetchAuthenticatedUser,
  updateUserDetails,
};

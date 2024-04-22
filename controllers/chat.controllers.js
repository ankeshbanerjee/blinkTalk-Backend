import ErrorHandler from "../middlewares/error.middleware.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

const accessChat = async (req, res, next) => {
  try {
    const { userId, userName } = req.body;
    let existingChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: req.user._id } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    existingChat = await User.populate(existingChat, {
      path: "latestMessage.sender",
      select: "name email pic",
    });

    if (existingChat) {
      return res.status(200).json({
        chat: existingChat,
        success: true,
        message: "chat fetched",
      });
    } else {
      const chat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [userId, req.user._id],
      });

      const fullChat = await Chat.findById(chat._id).populate(
        "users",
        "-password"
      );

      res.status(200).json({
        result: {
          chat: fullChat,
        },
        success: true,
        message: "chat created and fetched",
      });
    }
  } catch (error) {
    next(error);
  }
};

const fetchChats = async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 }) // -1 for descending, 1 for ascending order
      .then((result) => {
        User.populate(result, {
          path: "latestMessage.sender",
          select: "name email pic",
        })
          .then((chats) => {
            res.status(200).json({
              result: {
                chats,
              },
              success: true,
              message: "chats fetched",
            });
          })
          .catch((error) => next(error));
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
};

const createGroupChat = async (req, res, next) => {
  try {
    const { chatName, users } = req.body;
    if (!chatName || !users) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }
    if (users.length < 2) {
      return next(
        new ErrorHandler("Add atleast 2 users to create a group", 400)
      );
    }
    users.push(req.user._id);
    const groupChat = await Chat.create({
      chatName,
      isGroupChat: true,
      users,
      groupAdmin: req.user._id,
    });
    const groupChatDetailed = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      result: {
        chat: groupChatDetailed,
      },
      success: true,
      message: "group chat created",
    });
  } catch (error) {
    next(error);
  }
};

const renameGroup = async (req, res, next) => {
  try {
    const { chatName, groupChatId } = req.body;
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      groupChatId,
      {
        chatName,
      },
      {
        new: true, // returns the updated document, not doing this will return the old one
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroupChat) {
      return next(new ErrorHandler("group chat not found", 404));
    }

    res.status(200).json({
      result: {
        chat: updatedGroupChat,
      },
      success: true,
      message: "group chat renamed",
    });
  } catch (error) {
    next(error);
  }
};

const addToGroup = async (req, res, next) => {
  try {
    const { userId, groupChatId } = req.body;
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      groupChatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroupChat) {
      return next(new ErrorHandler("Group chat not found", 404));
    } else {
      res.status(200).json({
        result: {
          chat: updatedGroupChat,
        },
        success: true,
        message: "user added to group",
      });
    }
  } catch (error) {
    next(error);
  }
};

const removeFromGroup = async (req, res, next) => {
  try {
    const { userId, groupChatId } = req.body;
    const updatedGroupChat = await Chat.findByIdAndUpdate(
      groupChatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedGroupChat) {
      return next(new ErrorHandler("Group chat not found", 404));
    } else {
      res.status(200).json({
        result: {
          chat: updatedGroupChat,
        },
        success: true,
        message: "user removed from group",
      });
    }
  } catch (error) {
    next(error);
  }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};

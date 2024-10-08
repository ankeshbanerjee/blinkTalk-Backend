import ErrorHandler from "../middlewares/error.middleware.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import admin from "firebase-admin";

const sendMessage = async (req, res, next) => {
  try {
    const { content, attachment, chatId } = req.body;
    if (!chatId) {
      return next(new ErrorHandler("chatId not found", 400));
    }

    // this promise returns a document
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
      ...(attachment && { attachment }),
    });

    // update the lastmessage in the chat
    let chat = await Chat.findById(chatId);
    chat.latestMessage = message._id;
    await chat.save();

    // populating the document that we got
    // previously we had to chain 'execPopulate()' at the end to populate a document
    // but execPopulate() is removed in mongoose 6.x, so we don't need that
    message = await message.populate(
      "sender",
      "name email profilePicture createdAt"
    );
    message = await message.populate("chat");

    // fetch the members in the chat-room to send notifications to them\
    const members = await User.find({ _id: { $in: chat.users } });

    // populating the chat
    chat = await Chat.findById(chatId)
      .populate("users", "_id name email profilePicture isAdmin")
      .populate({
        path: "latestMessage",
        select: "content chat",
        populate: {
          path: "sender",
          select: "_id name email",
        },
      });

    // sending notifications
    members.forEach(async (member) => {
      if (member._id.toString() !== req.user._id.toString()) {
        if (member.fcmTokens.length === 0) {
          return;
        }
        member.fcmTokens.forEach(async (token) => {
          const message = {
            data: {
              title: req.user.name,
              body: content,
              chat: JSON.stringify(chat),
              navigationId: "chat",
            },
            token,
          };
          console.log(token);
          try {
            await admin.messaging().send(message);
          } catch (error) {
            console.log(error);
          }
        });
      }
    });

    res.status(200).send({
      result: {
        message,
      },
      success: true,
      message: "message sent",
    });
  } catch (error) {
    next(error);
  }
};

const fetchMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return next(new ErrorHandler("please fill all the fields", 400));
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email profilePicture createdAt")
      .populate("chat");

    res.status(200).send({
      result: {
        messages,
      },
      success: true,
      message: "messages fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { sendMessage, fetchMessages };

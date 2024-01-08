import ErrorHandler from "../middlewares/error.middleware.js";
import Message from "../models/message.model.js";

const sendMessage = async (req, res, next) => {
  try {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      return next(new ErrorHandler("Please fill all the fields", 400));
    }

    // this promise returns a document
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    // populating the document that we got
    // previously we had to chain 'execPopulate()' at the end to populate a document
    // but execPopulate() is removed in mongoose 6.x, so we don't need that
    message = await message.populate("sender", "name email pic");
    message = await message.populate("chat");
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
      .populate("sender", "name email pic")
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

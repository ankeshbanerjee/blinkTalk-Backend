import mongoose from "mongoose";

const connectToDb = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      // dbName: "blinkTalk_backend",
      dbName: "blinkTalk-DB",
    })
    .then(() => console.log("database connected"))
    .catch((err) => console.log(err));
};

export default connectToDb;

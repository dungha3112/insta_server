import mongoose from "mongoose";
import { INotify } from "../configs/interfaces";

const notifySchema = new mongoose.Schema<INotify>(
  {
    id: String,
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    recipients: [{ type: String, default: [] }],
    url: String,
    text: String,
    content: String,
    image: String,
    isUserReaded: [{ type: String, default: [] }],
  },
  {
    timestamps: true,
  }
);

const NotifyModel = mongoose.model("Notify", notifySchema);
export default NotifyModel;

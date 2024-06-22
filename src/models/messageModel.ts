import mongoose from "mongoose";
import { IMessage } from "../configs/interfaces";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversation: { type: mongoose.Types.ObjectId, ref: "Conversation" },
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Types.ObjectId, ref: "User" },
    text: String,
    media: Array,
    call: Object,
  },
  {
    timestamps: true,
  }
);

const MessagesModel = mongoose.model<IMessage>("Message", messageSchema);

export default MessagesModel;

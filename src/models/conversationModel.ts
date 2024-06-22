import mongoose from "mongoose";
import { IConversation } from "../configs/interfaces";

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    recipients: [{ type: mongoose.Types.ObjectId, ref: "User", default: [] }],
    text: String,
    media: Array,
    call: Object,
    isRead: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ConversationModel = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default ConversationModel;

import mongoose from "mongoose";
import { IComment } from "../configs/interfaces";

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: { type: String, required: true },
    tag: Object,
    reply: { type: mongoose.Types.ObjectId, ref: "Comment" },
    postId: { type: mongoose.Types.ObjectId, ref: "Post" },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    postUserId: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<IComment>("Comment", commentSchema);
export default CommentModel;

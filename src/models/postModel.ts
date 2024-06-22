import mongoose from "mongoose";
import { IPost } from "../configs/interfaces";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: String,
    images: { type: Array, default: [] },
    likes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
    user: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model<IPost>("Post", postSchema);
export default PostModel;

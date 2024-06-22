import { Response } from "express";
import { IComment, IReqAuth } from "../configs/interfaces";
import CommentModel from "../models/commentModel";
import PostModel from "../models/postModel";

class commentCtrl {
  async createComment(req: IReqAuth, res: Response) {
    try {
      const { postId, content, tag, reply, postUserId } = <IComment>req.body;

      const post = await PostModel.findById(postId);
      if (!post)
        return res.status(400).json({ msg: "This post does not exist." });

      if (reply) {
        const cm = await CommentModel.findById(reply);
        if (!cm)
          return res.status(400).json({ msg: "This comment does not exist." });
      }

      const newComment = new CommentModel({
        user: req.user?._id,
        content,
        tag,
        reply,
        postId,
        postUserId,
      });

      await PostModel.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id } },
        { new: true }
      );

      await newComment.save();

      res.status(200).json({ newComment });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async updateComment(req: IReqAuth, res: Response) {
    try {
      const { content } = <IComment>req.body;

      const newComment = await CommentModel.findOneAndUpdate(
        { _id: req.params.commentId, user: req.user?._id },
        { content },
        { new: true }
      );
      if (!newComment) return res.status(400).json({ msg: "Wrong!" });

      res.status(200).json({ msg: "Updated comment" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getCommentLike(req: IReqAuth, res: Response) {
    try {
      const comment = await CommentModel.findById(
        req.params.commentId
      ).populate({
        path: "likes",
        select: "_id avatar username fullname followers following",
        populate: {
          path: "followers following",
          select: "_id avatar username fullname",
        },
      });

      res.status(200).json(comment?.likes);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async likeComment(req: IReqAuth, res: Response) {
    try {
      const comment = await CommentModel.find({
        _id: req.params.commentId,
        likes: req.user?._id,
      });
      if (comment.length > 0)
        return res.status(400).json({ msg: "You liked this comment." });

      await CommentModel.findOneAndUpdate(
        { _id: req.params.commentId },
        {
          $push: { likes: req.user?._id },
        },
        { new: true }
      );

      res.status(200).json({ msg: "Liked Comment!" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async unLikeComment(req: IReqAuth, res: Response) {
    try {
      await CommentModel.findOneAndUpdate(
        { _id: req.params.commentId },
        {
          $pull: { likes: req.user?._id },
        },
        { new: true }
      );

      res.status(200).json({ msg: "UnLiked Comment!" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteComment(req: IReqAuth, res: Response) {
    try {
      const comment = await CommentModel.findOneAndDelete({
        _id: req.params.commentId,
      });
      if (!comment) return res.status(400).json({ msg: "Comment not found." });

      await PostModel.findOneAndUpdate(
        { _id: comment.postId._id },
        { $pull: { comments: req.params.commentId } }
      );

      res.status(200).json({ msg: "Delete Comment!" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
}

export default new commentCtrl();

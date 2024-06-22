import { Response } from "express";
import { IPost, IReqAuth, IUser } from "../configs/interfaces";
import CommentModel from "../models/commentModel";
import PostModel from "../models/postModel";
import UserModel from "../models/userModel";

class APIfeatures {
  query: any;
  queryString: any;
  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page: number = Number(this.queryString.page) * 1 || 1;
    const limit: number = Number(this.queryString.limit * 1) || 9;
    const skip: number = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

class postCtrl {
  async createPost(req: IReqAuth, res: Response) {
    try {
      const { content, images } = <IPost>req.body;

      const newPost = new PostModel({ content, images, user: req.user?._id });

      await newPost.save();
      res.status(200).json({
        msg: "Create posts.",
        newPost: { ...newPost._doc, user: req.user },
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getPosts(req: IReqAuth, res: Response) {
    try {
      const features = new APIfeatures(
        PostModel.find({
          user: [...(req.user as IUser)?.following, req.user?._id],
        }),
        req.query
      ).paginating();

      const posts = await features.query
        .populate([
          {
            path: "user",
            select: "_id avatar username fullname followers",
          },
          {
            path: "comments",
            populate: {
              path: "user likes",
              select: "_id avatar username fullname",
            },
          },
        ])
        .sort("-createdAt");

      res.status(200).json({
        msg: "Get posts.",
        result: posts.length,
        posts,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async updatePost(req: IReqAuth, res: Response) {
    try {
      const { content, images } = <IPost>req.body;

      const checkPost = await PostModel.findOne({
        _id: req.params.postId,
        user: req.user?._id,
      });
      if (!checkPost)
        return res.status(400).json({ msg: "You con't edit post." });

      const post = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { content, images },
        { new: true }
      ).populate([
        {
          path: "comments",
          populate: {
            path: "user likes",
            select: "_id avatar username fullname",
          },
        },
      ]);

      if (!post) return res.status(404).json({ msg: "Post not found." });

      res.status(200).json({
        msg: "Updated posts.",
        post,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
  async getLikePost(req: IReqAuth, res: Response) {
    try {
      const post = await PostModel.findById(req.params.postId)
        .populate({
          path: "likes",
          select: "_id avatar username fullname followers following",
          populate: {
            path: "followers following",
            select: "_id avatar username fullname",
          },
        })
        .sort("-createdAt");

      res.status(200).json(post?.likes);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
  async likePost(req: IReqAuth, res: Response) {
    try {
      const post = await PostModel.find({
        _id: req.params.postId,
        likes: req.user?._id,
      });
      if (post.length > 0)
        return res.status(400).json({ msg: "You liked this post." });

      const like = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { $push: { likes: req.user?._id } },
        { new: true }
      );
      if (!like)
        return res.status(400).json({
          msg: "This post does not exist.",
        });

      res.status(200).json({
        msg: "Liked posts.",
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
  async unLikePost(req: IReqAuth, res: Response) {
    try {
      const unlike = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { $pull: { likes: req.user?._id } },
        { new: true }
      );
      if (!unlike)
        return res.status(400).json({ msg: "This post does not exist." });

      res.status(200).json({
        msg: "unLiked posts.",
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getUserPosts(req: IReqAuth, res: Response) {
    try {
      const features = new APIfeatures(
        PostModel.find({ user: req.params.userId }),
        req.query
      ).paginating();

      const posts = await features.query.sort("-createdAt");

      res.status(200).json({ posts, results: Number(posts?.length) });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getPost(req: IReqAuth, res: Response) {
    try {
      const post = await PostModel.findById(req.params.postId).populate([
        { path: "user", select: "_id avatar username fullname followers" },
        {
          path: "comments",
          populate: {
            path: "user likes",
            select: "_id avatar username fullname",
          },
        },
      ]);

      res.status(200).json({ post });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getPostsExplore(req: IReqAuth, res: Response) {
    try {
      const newArr = [...(req.user as IUser)?.following, req.user?._id];

      const num = req.query.num || 3;
      const posts = await PostModel.aggregate([
        { $match: { user: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
      ]);

      res.status(200).json({
        msg: "Get posts successfully.",
        result: posts.length,
        posts,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deletePost(req: IReqAuth, res: Response) {
    try {
      const post = await PostModel.findOneAndDelete({
        _id: req.params.postId,
        user: req.user?._id,
      });
      if (!post)
        return res.status(400).json({ msg: "This post does not exist" });

      await CommentModel.deleteMany({ _id: { $in: post.comments } });

      res.status(200).json({
        msg: "Deleted post",
        newPost: { ...post._doc, user: req.user },
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async savePost(req: IReqAuth, res: Response) {
    try {
      const user = await UserModel.findOne({
        _id: req.user?._id,
        saved: req.params.postId,
      });
      if (user) return res.status(400).json({ msg: "You saved this post." });

      const save = await UserModel.findByIdAndUpdate(
        req.user?._id,
        { $push: { saved: req.params.postId } },
        { new: true }
      );

      if (!save) res.status(400).json({ msg: "This post does not exist." });

      res.status(200).json({ msg: "Saved post." });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
  async unSavePost(req: IReqAuth, res: Response) {
    try {
      const unSave = await UserModel.findByIdAndUpdate(
        req.user?._id,
        { $pull: { saved: req.params.postId } },
        { new: true }
      );

      if (!unSave) res.status(400).json({ msg: "This post does not exist." });

      res.status(200).json({ msg: "Un-saved post." });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getSavePosts(req: IReqAuth, res: Response) {
    try {
      const features = new APIfeatures(
        PostModel.find({ _id: { $in: req.user?.saved } }),
        req.query
      ).paginating();
      const posts = await features.query.sort("-createdAt");

      res.status(200).json({ posts, result: posts.length });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
}

export default new postCtrl();

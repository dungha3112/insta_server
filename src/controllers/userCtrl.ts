import bcrypt from "bcrypt";
import { Request, Response, raw } from "express";
import UserModel from "../models/userModel";
import { IReqAuth, IUser } from "../configs/interfaces";

class userCtrl {
  async searchUser(req: Request, res: Response) {
    try {
      const users = await UserModel.find({
        username: { $regex: `${req.query.username}`, $options: "i" },
      })
        .limit(10)
        .select("_id fullname username avatar");

      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async addHistorySearch(req: IReqAuth, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await UserModel.findOne({
        _id: req.user?._id,
        historySearch: userId,
      });

      if (!user) {
        const update = await UserModel.findByIdAndUpdate(
          req.user?._id,
          { $push: { historySearch: userId } },
          { new: true }
        );

        return res.status(200).json({
          msg: "Add user search to list user search successfully.",
        });
      } else {
        return res.status(200).json({
          msg: "Add user search to list user search successfully.",
        });
      }
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getHistorySearch(req: IReqAuth, res: Response) {
    try {
      const list = await UserModel.findById(req.user?._id)
        .select("historySearch")
        .populate("historySearch", "_id fullname username avatar");

      res.status(200).json(list?.historySearch);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteHistorySearchByUserId(req: IReqAuth, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await UserModel.findOne({
        _id: req.user?._id,
        historySearch: userId,
      });

      if (user) {
        const update = await UserModel.findByIdAndUpdate(
          req.user?._id,
          { $pull: { historySearch: userId } },
          { new: true }
        );

        return res.status(200).json({
          msg: "Remove user by id from list user search successfully.",
        });
      } else {
        return res.status(200).json({
          msg: "Remove user by id from list user search successfully.",
        });
      }
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteAllHistorySearch(req: IReqAuth, res: Response) {
    try {
      const update = await UserModel.findByIdAndUpdate(
        req.user?._id,
        { historySearch: [] },
        { new: true }
      );
      res.status(200).json({ msg: "History search cleared successfully." });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getUserById(req: IReqAuth, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await UserModel.findById(userId).populate({
        path: "followers following",
        select: "avatar username fullname followers following",
      });

      if (!user) return res.status(400).json({ msg: "User not found" });

      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getFollowersByUserId(req: IReqAuth, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await UserModel.findById(userId).populate({
        path: "followers",
        select: "avatar username fullname",
      });

      if (!user) return res.status(400).json({ msg: "User not found" });

      res.status(200).json(user.followers);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
  async getFollowingByUserId(req: IReqAuth, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await UserModel.findById(userId).populate({
        path: "following",
        select: "avatar username fullname",
      });

      if (!user) return res.status(400).json({ msg: "User not found" });

      res.status(200).json(user.following);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async updateProfile(req: IReqAuth, res: Response) {
    try {
      const { username, fullname, avatar, gender, bio, website } = <IUser>(
        req.body
      );

      const updateProfile = await UserModel.findByIdAndUpdate(
        req.user?._id,
        {
          username,
          fullname,
          avatar,
          gender,
          bio,
          website,
        },
        { new: true }
      );

      res.status(200).json({
        msg: "Updated profile successfully",
        user: updateProfile,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async updatePassword(req: IReqAuth, res: Response) {
    try {
      const { password, oldPassword } = req.body;

      const user = await UserModel.findById(req.user?._id).select("+password");

      if (!user)
        return res.status(400).json({ msg: "User not found with email." });

      const isMatchedPassword = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isMatchedPassword)
        return res.status(400).json({ msg: "Invalid old password" });

      const hashPassword = await bcrypt.hash(password, 12);
      await UserModel.findByIdAndUpdate(
        req.user?._id,
        { password: hashPassword, refreshToken: "" },
        { new: true }
      );
      res.clearCookie("refreshToken");

      res.status(200).json({
        msg: "Updated password successfully",
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async follow(req: IReqAuth, res: Response) {
    try {
      const user = await UserModel.find({
        _id: req.params.id,
        followers: req.user?._id,
      });
      if (user.length > 0)
        return res.status(500).json({ msg: "You followed this user." });

      const newUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $push: { followers: req.user?._id } },
        { new: true }
      ).populate("followers following");

      await UserModel.findByIdAndUpdate(
        req.user?._id,
        { $push: { following: req.params.id } },
        { new: true }
      );

      return res.status(200).json({ msg: "Followed user.", newUser });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async unfollow(req: IReqAuth, res: Response) {
    try {
      const newUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { followers: req.user?._id } },
        { new: true }
      ).populate("followers following");

      await UserModel.findByIdAndUpdate(
        req.user?._id,
        { $pull: { following: req.params.id } },
        { new: true }
      );

      return res.status(200).json({ msg: "Unfollowed user.", newUser });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getSuggestionsUser(req: IReqAuth, res: Response) {
    try {
      const newArr = [...(req.user as IUser)?.following, req.user?._id];
      const num = req.query.num || 5;

      const users = await UserModel.aggregate([
        { $match: { _id: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
        {
          $project: {
            _id: 1,
            fullname: 1,
            username: 1,
            avatar: 1,
            followers: 1,
            following: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followers",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "following",
            foreignField: "_id",
            as: "following",
          },
        },

        {
          $project: {
            _id: 1,
            fullname: 1,
            username: 1,
            avatar: 1,
            followers: {
              $map: {
                input: "$followers",
                as: "follower",
                in: {
                  _id: "$$follower._id",
                  fullname: "$$follower.fullname",
                  username: "$$follower.username",
                  avatar: "$$follower.avatar",
                },
              },
            },
            following: {
              $map: {
                input: "$following",
                as: "following",
                in: {
                  _id: "$$following._id",
                  fullname: "$$following.fullname",
                  username: "$$following.username",
                  avatar: "$$following.avatar",
                },
              },
            },
          },
        },
      ]);

      res.status(200).json({ users, result: users.length });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
}

export default new userCtrl();

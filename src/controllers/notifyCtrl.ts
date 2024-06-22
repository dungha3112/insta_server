import { Response } from "express";
import { INotify, IReqAuth } from "../configs/interfaces";
import NotifyModel from "../models/notifyModel";

class notifyCtrl {
  async create(req: IReqAuth, res: Response) {
    try {
      const { id, recipients, url, text, content, image } = <INotify>req.body;
      if (recipients.includes(req.user?._id.toString())) return;

      const newNotify = new NotifyModel({
        id,
        recipients,
        url,
        text,
        content,
        image,
        user: req.user?._id,
      });

      await newNotify.save();

      res.status(200).json({ msg: "Creat a new notify", newNotify });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async remove(req: IReqAuth, res: Response) {
    try {
      await NotifyModel.findOneAndDelete({
        id: req.params.id,
        url: String(req.query.url),
      });

      res.status(200).json({ msg: "Removed notify" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getNotifies(req: IReqAuth, res: Response) {
    try {
      const notifies = await NotifyModel.find({ recipients: req.user?._id })
        .sort("-createdAt")
        .populate("user", "avatar username");

      res.status(200).json({ msg: "Get notifies", notifies });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async readNotify(req: IReqAuth, res: Response) {
    try {
      const check = await NotifyModel.findOne({
        _id: req.params.notifyId,
        recipients: req.user?._id,
      });
      if (!check) return res.status(400).json({ msg: "Something is wrong'" });

      const checkIsReaded = await NotifyModel.findOne({
        _id: req.params.notifyId,
        isUserReaded: req.user?._id,
      });
      if (checkIsReaded)
        return res.status(200).json({
          msg: "Read notify",
          readNotify: checkIsReaded,
        });

      const readNotify = await NotifyModel.findByIdAndUpdate(
        req.params.notifyId,
        { $push: { isUserReaded: req.user?._id } },
        { new: true }
      );
      res.status(200).json({ msg: "Read notify", readNotify });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteANotify(req: IReqAuth, res: Response) {
    try {
      const notify = await NotifyModel.findOneAndUpdate(
        { _id: req.params.notifyId },
        { $pull: { recipients: req.user?._id } },
        { new: true }
      );

      if (!notify) return res.status(400).json({ msg: "Something is wrong'" });

      if (notify.recipients.length === 0) {
        await NotifyModel.findByIdAndDelete(req.params.notifyId);
      }

      res.status(200).json({ msg: "Delete a notify", notify });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteAllNotify(req: IReqAuth, res: Response) {
    try {
      await NotifyModel.updateMany(
        {},
        { $pull: { recipients: req.user?._id } }
      );

      res.status(200).json({ msg: "Delete all notify" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
}

export default new notifyCtrl();

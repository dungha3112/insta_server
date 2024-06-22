import { Response } from "express";
import { IConversation, IMessage, IReqAuth } from "../configs/interfaces";
import ConversationModel from "../models/conversationModel";
import MessagesModel from "../models/messageModel";

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

class messageCtrl {
  async createMessage(req: IReqAuth, res: Response) {
    try {
      const { sender, call, recipient, text, media } = <IMessage>req.body;

      if (!recipient || (!text.trim() && media.length === 0 && !call)) return;

      const newConversation = <IConversation>(
        await ConversationModel.findOneAndUpdate(
          {
            $or: [
              { recipients: [String(sender), String(recipient)] },
              { recipients: [String(recipient), String(sender)] },
            ],
          },
          {
            recipients: [String(sender), String(recipient)],
            text,
            media,
            call,
            isRead: true,
          },
          { new: true, upsert: true }
        )
      );

      const newMessage = <IMessage>new MessagesModel({
        conversation: newConversation,
        sender,
        recipient,
        text,
        media,
        call,
      });

      await newMessage.save();

      res.status(200).json({
        msg: "Create a new conversation",
        newMessage,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getConversations(req: IReqAuth, res: Response) {
    try {
      const features = new APIfeatures(
        ConversationModel.find({
          recipients: req.user?._id,
        }),
        req.query
      ).paginating();

      const conversations = await features.query
        .sort("-updatedAt")
        .populate("recipients", "avatar username fullname");

      res.status(200).json({ conversations, result: conversations.length });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async getMessages(req: IReqAuth, res: Response) {
    try {
      const features = new APIfeatures(
        MessagesModel.find({
          $or: [
            {
              sender: String(req.user?._id),
              recipient: String(req.params.userId),
            },
            {
              sender: String(req.params.userId),
              recipient: String(req.user?._id),
            },
          ],
        }),
        req.query
      ).paginating();

      const messages = await features.query.sort("-createdAt");

      res.status(200).json({ messages, result: messages.length });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteMessage(req: IReqAuth, res: Response) {
    try {
      await MessagesModel.findOneAndDelete({
        _id: req.params.msgId,
        sender: req.user?._id,
      });

      res.status(200).json({ msg: "Deleted messages." });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async deleteConversation(req: IReqAuth, res: Response) {
    try {
      const newConver = await ConversationModel.findOneAndDelete({
        $or: [
          { recipients: [req.user?._id, req.params.userId] },
          { recipients: [req.params.userId, req.user?._id] },
        ],
      });
      await MessagesModel.deleteMany({ conversation: newConver?._id });

      res.status(200).json({ msg: "Delete success." });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
}

export default new messageCtrl();

import { Request } from "express";
import { Document } from "mongoose";

export interface ISignIn extends Document {
  email: string;
  password: string;
}

export interface ISignUp extends ISignIn {
  fullname: string;
  username: string;
  gender: string;
}

export interface IUser extends ISignUp {
  avatar: string;
  role: string;
  bio: string;
  story: string;
  website: string;
  followers: [IUser];
  following: [IUser];
  saved: IPost[];
  refreshToken: string;
  mobile: string;
  historySearch: [IUser];

  _doc: object;
}

export interface IDecoded {
  id: string;
  iat: number;
  exp: number;
}

export interface IReqAuth extends Request {
  user?: IUser;
}

export interface IPost extends Document {
  content: string;
  images?: Array<object>;
  likes: [IUser];
  comments: IComment[];
  user: IUser;

  _doc: object;
}

export interface IComment extends Document {
  content: string;
  tag: Object;
  reply: IUser;
  user: IUser;
  likes: [IUser];
  postId: IPost;
  postUserId: IUser;

  _doc: object;
}

export interface ISocket {
  id: string;
  socketId: string;
  followers: [IUser];
  call: any;
}

export interface INotify extends Document {
  id: string;
  user: IUser;
  recipients: string[];
  url: string;
  text: string;
  content: string;
  image: string;
  isUserReaded: string[];

  _doc: object;
}

export interface IConversation extends Document {
  recipients: [IUser];
  text: string;
  media: Array<string>;
  call: Object;
  isRead: boolean;
}
export interface IMessage extends Document {
  conversation: IConversation;
  sender: IUser;
  recipient: IUser;
  text: string;
  media: Array<object>;
  call: Object;
}

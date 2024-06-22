import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { IDecoded, IReqAuth } from "../configs/interfaces";
import UserModel from "../models/userModel";

const auth = async (req: IReqAuth, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(500).json({ msg: "Invalid Authentication." });

    const decoded = <IDecoded>(
      jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`)
    );
    if (!decoded)
      return res.status(500).json({ msg: "Invalid Authentication." });

    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(500).json({ msg: "Invalid Authentication." });

    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

export default auth;

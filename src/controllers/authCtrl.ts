import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../configs/generaToken";
import { IDecoded, ISignIn, ISignUp, IReqAuth } from "../configs/interfaces";
import UserModel from "../models/userModel";

class authCtrl {
  async signup(req: Request, res: Response) {
    try {
      const { email, fullname, gender, username, password } = <ISignUp>req.body;
      let newUserName = username.toLowerCase().replace(/ /g, "");

      const new_username = await UserModel.findOne({ username: newUserName });
      if (new_username)
        return res.status(400).json({ msg: "This username already exists." });

      const user_email = await UserModel.findOne({ email: email });
      if (user_email)
        return res.status(400).json({ msg: "This email already exists." });

      const hashPassword = await bcrypt.hash(password, 12);

      const newUser = new UserModel({
        email,
        fullname,
        gender,
        username,
        password: hashPassword,
      });

      await newUser.save();
      const access_token = await generateAccessToken({ id: newUser._id });
      const refresh_token = await generateRefreshToken(
        { id: newUser._id },
        res
      );
      newUser.refreshToken = refresh_token;
      await newUser.save();

      res.status(200).json({
        msg: "Register successfully",
        access_token,
        user: { ...newUser._doc, password: "", refreshToken: "" },
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async signin(req: Request, res: Response) {
    try {
      const { email, password } = <ISignIn>req.body;

      const user = await UserModel.findOne({ email })
        .select("+password")
        .populate(
          "followers following",
          "avatar username fullname followers following"
        );
      if (!user)
        return res.status(400).json({ msg: "User not found with email." });

      const isMatchedPassword = await bcrypt.compare(password, user.password);

      if (!isMatchedPassword)
        return res.status(400).json({ msg: "Invalid password" });

      const access_token = await generateAccessToken({ id: user._id });
      const refresh_token = await generateRefreshToken({ id: user._id }, res);
      user.refreshToken = refresh_token;

      await user.save();

      res.status(200).json({
        msg: "Login successfully",
        access_token,
        user: { ...user._doc, password: "", refreshToken: "" },
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const rf_token = req.cookies.refreshToken;

      if (!rf_token) return res.status(403).json({ msg: "Please login now." });

      const decoded = <IDecoded>(
        await jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`)
      );

      const user = await UserModel.findById(decoded.id)
        .select("-password +refreshToken")
        .populate(
          "followers following",
          "avatar username fullname followers following"
        );

      if (!user)
        return res.status(400).json({ msg: "This account does not exist." });
      if (rf_token !== user.refreshToken)
        return res.status(400).json({ msg: "Please, login now!." });

      const access_token = await generateAccessToken({ id: user._id });
      const refresh_token = await generateRefreshToken({ id: user._id }, res);

      user.refreshToken = refresh_token;
      await user.save();

      res.json({
        access_token,
        user: { ...user._doc, refreshToken: "" },
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
  async logout(req: IReqAuth, res: Response) {
    try {
      res.clearCookie("refreshToken");
      await UserModel.findById(
        req.user?._id,
        { refreshToken: "" },
        { new: true }
      );
      res.status(200).json({ msg: "Logged" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  }
}

export default new authCtrl();

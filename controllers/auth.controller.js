import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    next(errorHandler(400, "All fields are required"));
  }

  const hashedPassword =await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.json({success:true,message:"Signup successful"});
  } catch (error) {
    next(error);
  }
};
 
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    const validPassword =await bcrypt.compare(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }
    const token = jwt.sign({ id: validUser._id ,isAdmin:validUser.isAdmin}, process.env.JWT_SECRET);

    // token in schema
    validUser.token = token;
    await validUser.save({ validateBeforeSave: false });
    const { password: pass, ...rest } = validUser._doc;
    
    res
      .status(200)
      .json({success:true,rest});
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id ,isAdmin:user.isAdmin},
        process.env.JWT_SECRET
      );
      user.token = token;
      await user.save({ validateBeforeSave: false });
      const { password, ...rest } = user._doc;
      
      res
        .status(200)
        .json({success:true,rest});
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword =await bcrypt.hash(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      newUser.token = token;
      await newUser.save({ validateBeforeSave: false });
      const { password, ...rest } = newUser._doc;
      
      res
        .status(200)
        .json({success:true,rest});
    }
  } catch (error) {
    next(error);
  }
};

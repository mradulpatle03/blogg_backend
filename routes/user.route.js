import express from "express";
//import upload from "../middlewares/multer.js";
import upload from "../middlewares/multer.js"
import { deleteUser, signout, updateUser,getUsers,getUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const userRouter = express.Router();

userRouter.put(
  "/update/:userId",
  verifyToken,
  upload.fields([{name:"imageFile",maxCount:1}]),
  updateUser
);
 

userRouter.delete('/delete/:userId',verifyToken,deleteUser);
userRouter.post('/signout',signout);
userRouter.get("/getusers",verifyToken,getUsers)
userRouter.get('/:userId',getUser)


export default userRouter;
 
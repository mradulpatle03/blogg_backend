import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost } from '../controllers/post.controller.js';
import upload from '../middlewares/multer.js';

const postRouter = express.Router();

postRouter.post('/create', verifyToken,upload.fields([{name:"image",maxCount:1}]), create)
postRouter.get('/getposts', getposts)
postRouter.delete('/deletepost/:postId/:userId', verifyToken, deletepost)
postRouter.put('/updatepost/:postId/:userId', verifyToken,upload.fields([{name:"image",maxCount:1}]), updatepost)

 
export default postRouter; 
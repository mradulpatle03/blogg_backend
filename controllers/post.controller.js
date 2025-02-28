import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import {v2 as cloudinary} from "cloudinary"

const create=async (req,res,next)=>{
    if (!req.user.isAdmin) {
        return next(errorHandler(403, 'You are not allowed to create a post'));
      }
      if (!req.body.title || !req.body.content) {
        return next(errorHandler(400, 'Please provide all required fields'));
      }
      const slug = req.body.title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '');

      const image = req.files?.image?.[0];
      let imageUrl;
      if(image?.path){
        const result = await cloudinary.uploader.upload(image.path, {
            resource_type: "image",
          });

          imageUrl = result.secure_url
      }else{
        imageUrl='https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png'
      }
      
      try {

        const newPost = new Post({
            ...req.body,
            image:imageUrl,
            slug,
            userId: req.user.id,
          });


        const savedPost = await newPost.save();
        res.status(201).json({success:true,message:"post created successfully",savedPost});
      } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:"Something went wrong"})
      }
}


const getposts=async (req,res,next)=>{
    try {
      console.log(req)
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === 'asc' ? 1 : -1;
        const posts = await Post.find({
          ...(req.query.userId && { userId: req.query.userId }),
          ...(req.query.category && { category: req.query.category }),
          ...(req.query.slug && { slug: req.query.slug }),
          ...(req.query.postId && { _id: req.query.postId }),
          ...(req.query.searchTerm && {
            $or: [
              { title: { $regex: req.query.searchTerm, $options: 'i' } },
              { content: { $regex: req.query.searchTerm, $options: 'i' } },
            ],
          }),  
        })
          .sort({ updatedAt: sortDirection })
          .skip(startIndex)
          .limit(limit);
    
        const totalPosts = await Post.countDocuments();
    
        const now = new Date();
    
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
    
        const lastMonthPosts = await Post.countDocuments({
          createdAt: { $gte: oneMonthAgo },
        });
    
        res.status(200).json({
          success:true, 
          posts,
          totalPosts, 
          lastMonthPosts,
        });
      } catch (error) {
        console.log(error)
        next(error);

      }
}
const deletepost=async (req,res,next)=>{
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
        return next(errorHandler(403, 'You are not allowed to delete this post'));
      }
      try {
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json('The post has been deleted');
      } catch (error) {
        next(error);
      }
}

const updatepost=async (req,res,next)=>{
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to update a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');

  const image = req.files?.image?.[0];
  let imageUrl;
  if(image?.path){
    const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "image",
      });

      imageUrl = result.secure_url
  }else{
    imageUrl=req.user.image;
  }
  
  try {

    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: imageUrl,
          
        },
      },
      { new: true }
    );
    res.status(201).json({success:true,message:"post updated successfully",updatedPost,slug});
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Something went wrong"})
  }
}

export {
    create,
    deletepost,
    getposts,
    updatepost
}
import express from "express"
import mongoose from "mongoose";
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
import {connectCloudinary} from './config/cloudinary.js';
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
dotenv.config()
const connectDB = async ()=>{
    try {
        const connectionInstance=await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connection SUCCESS',connectionInstance.connection.host);
    } catch (error) {
        console.error('MongoDB connection FAIL',error.message);
    }
}
connectDB()
connectCloudinary()


const app= express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:["http://localhost:5173"],
    methods:["GET","POST","PUT","DELETE","HEAD","PATCH"],
    credentials:true

}))
app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/post',postRouter);
app.use("/api/comment",commentRouter);
app.get('/', (req, res) =>{
    res.send('API is running...');
})

app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500 ;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
        success:false,
        statusCode,
        message
    })
})

app.listen(process.env.PORT,()=>{
    console.log("api is working")
})
import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
    
  try {
    const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    
    return res.status(401).json({success:false,unAuthorized:true,message:"Session terminated , Please login again !"})
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({success:false,unAuthorized:true,message:"Unauthorized , Please login again !"})
    }
    req.user = user;
    
    next();
  });
  } catch (error) {
    console.log("error in verifying user",error);
  }
};
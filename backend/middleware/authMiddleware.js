const jwt = require("jsonwebtoken");
const User = require("../models/user");
require('dotenv').config();



const authMiddleware = async(req, res, next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1]
        if(!token){
            return res.status(401).json({success: false, message: "No token provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded){
             return res.status(401).json({success: false, message: "Invalid Token"})
        }

        const user = await User.findById({_id: decoded.id})
        if(!user){
             return res.status(401).json({success: false, message: "User not found"})
        }
        req.user = user;
        next()
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal server error ind middleware"})
    }
}

module.exports = authMiddleware;
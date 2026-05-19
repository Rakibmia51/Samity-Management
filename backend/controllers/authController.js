const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config()



const login = async(req, res)=>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({success: false, message: "User not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({success: false, message: "Invalid Credentials"})
        }
        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'})
            return res.status(200).json({
                                        success: true, 
                                        message: 'login successfull', 
                                        token, 
                                        user:{
                                                id: user._id, 
                                                fullName: user.fullName, 
                                                email: user.email, 
                                                role: user.role
                                            }
                                    })
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal Server error"})
    }
}


module.exports= {login}
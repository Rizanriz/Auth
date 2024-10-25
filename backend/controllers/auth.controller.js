import {User} from '../models/user.model.js'
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'

export const signup = async (req,res)=>{
    const {email,password,name} = req.body
    try {
        if (!email || !password || !name) {
            throw new Error("all fields are required")
        }
        const userAlreadyExist = await User.findOne({email})
        if (userAlreadyExist) {
            return res.status(400).json({success:false,message:"User already exists"})
        }

        const hashedpassword = await bcrypt.hash(password,10)
        const verificationToken = Math.floor(100000  + Math.random() * 900000).toString()
        
        const user = new User({
            email,
            password:hashedpassword,
            name,
            lastLogin:new Date(),
            verificationToken,
            verificationTokenExpiresAt:Date.now() + 24 * 60 * 60 * 1000
        })
        await user.save()

        generateTokenAndSetCookie(res,user._id) 
        res.status(201).json({success:true,message:"User created successfully",
            user:{
                ...user._doc,
                password:undefined
            }
        })
    } catch (error) {
        return res.status(400).json({success:false,message:error.message})
    }
}
export const login = async (req,res)=>{
    res.send("signup")
}
export const logout = async (req,res)=>{
    res.send("signup")
}

//9ufMXiMKIeThUJcb
//Sri6AE1bcfJw2cGQ
import { User } from '../models/user.model.js'
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { sendPasswordResetEmail, sendResetSuccessfullEmail, sendVerificationEmail, sendWelcomeEmail } from '../mail/Emails.js'

export const signup = async (req, res) => {
    const { email, password, name } = req.body
    try {
        if (!email || !password || !name) {
            throw new Error("all fields are required")
        }
        const userAlreadyExist = await User.findOne({ email })
        if (userAlreadyExist) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const hashedpassword = await bcrypt.hash(password, 10)
        const verificationToken = String(Math.floor(100000 + Math.random() * 900000));

        const user = new User({
            email,
            password: hashedpassword,
            name,
            lastLogin: new Date(),
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        })
        await user.save()

        generateTokenAndSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken)
        res.status(201).json({
            success: true, message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const stringCode = String(code);

        const user = await User.findOne({
            verificationToken: stringCode,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("error in verifyEmail ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid credential" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: "Invalid credential" })
        }

        generateTokenAndSetCookie(res, user._id)

        user.lastLogin = new Date()
        await user.save()

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        })
    } catch (error) {
        console.log("error in login ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
export const logout = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "Logged out successfully" })
}

export const forgotPasword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(user.email, resetURL);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgot password", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or  expired token" });
        }

        const hashedpassword = await bcrypt.hash(password, 10)

        user.password = hashedpassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined
        await user.save()

        await sendResetSuccessfullEmail(user.email)

        return res.status(200).json({ success: true, message: "password reset successfull" });

    } catch (error) {
        console.log("Error in reset password", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req,res) =>{
    try {
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(400).json({success:false,message:"User not found"})
        }

        res.status(200).json({success:true,user})
    } catch (error) {
        console.error("Error in auth check:", error);
        return res.status(400).json({success:false,message:error.message    })
    }
}
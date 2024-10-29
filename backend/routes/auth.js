import express from "express" 
import { forgotPasword, login, logout, resetPassword, signup, verifyEmail } from "../controllers/auth.controller.js"

const router = express.Router()

router.post('/signup',signup) 

router.post('/login',login) 

router.post('/logout',logout) 

router.post('/verify-email',verifyEmail) 

router.post('/forgot-pasword',forgotPasword) 

router.post('/reset-pasword/:token',resetPassword) 
 
export default router
import mongoose from "mongoose";

 const connectDB = async ()=>{
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL)
        console.log("MONGODB CONNNECTED");
        
    } catch (error) {
        console.log("mongoDB connection failed");
    }
}

export default connectDB
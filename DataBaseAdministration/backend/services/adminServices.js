import adminModel from "../model/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
import dotenv from "dotenv"

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const adminServices = {
    adminlogin: async function(email , password){
        const admin = await adminModel.login(email);
        console.log("Found Admin:", admin); // ✅ log this
    
        if(!admin){
            throw new Error("Admin Not Found");
        }
    
        const isMatch = await bcrypt.compare(password , admin.password_hash);
        console.log("Password match:", isMatch); // ✅ log this
    
        if(!isMatch) {
            return false;
        }
    
        const token = jwt.sign(
            { id: admin.user_id, email: admin.email },
            JWT_SECRET, 
            { expiresIn: "1h" }
        );
    
        return { success: true, admin, token };
    }
    
}
export default adminServices;
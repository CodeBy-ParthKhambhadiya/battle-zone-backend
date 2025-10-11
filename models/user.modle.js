import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4, // generate UUID for each user
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true, 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  mobile: { 
    type: String 
  },
  address: { 
    type: String 
  },
  gender: { 
    type: String, 
    enum: ["MALE", "FEMALE", "OTHER"], 
  },
  gameId: { 
    type: Number 
  },
  gameUserName: { 
    type: String 
  },
  profileImage: { 
    type: String 
  },
  bio: { 
    type: String 
  },
  role: { 
    type: String, 
    enum: ["PLAYER", "ADMIN", "ORGANIZER"], 
    default: "PLAYER" 
  },

  emailOTP: { 
    type: String 
  },
  otpExpire: { 
    type: Date 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otpResendAt: {
    type: Date, 
  },
}, { 
  timestamps: true, 
});

const User = mongoose.model("User", userSchema);
export default User;

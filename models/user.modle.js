import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    gameId: {
      type: Number,
    },
    gameUserName: {
      type: String,
    },
    bio: {
      type: String,
    },
    role: {
      type: String,
      enum: ["PLAYER", "ADMIN", "ORGANIZER"],
      default: "PLAYER",
    },
    avatar: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
    upiId: {
      type: String,
    },
    otp: {
      type: String, // store OTP as string
    },
    otpExpire: {
      type: Date,
    },
    otpSentAt: {
      type: Date, // ✅ fixed type
    },
    otpResendAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index for unique email per role
userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;

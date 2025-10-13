import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const privateChatSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    senderId: {
      type: String,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: String,
      ref: "User",
      required: true,
    },
    messages: [
      {
        _id: {
          type: String,
          default: uuidv4,
        },
        sender: {
          type: String,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        readBy: [
          {
            type: String,
            ref: "User",
          },
        ],
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("PrivateChat", privateChatSchema);

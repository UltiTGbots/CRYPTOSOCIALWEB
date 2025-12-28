import { Schema, model, models, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    roomId: { type: String, index: true, required: true },
    fromUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    toUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Message = models.Message || model("Message", MessageSchema);

import { Schema, model, models, Types } from "mongoose";

const GroupSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    handle: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    isPrivate: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    membersCount: { type: Number, default: 1 },
    maxMembers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Group = models.Group || model("Group", GroupSchema);

import { Schema, model, models, Types } from "mongoose";

const GroupMemberSchema = new Schema(
  {
    groupId: { type: Types.ObjectId, ref: "Group", required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member", index: true },
    status: { type: String, enum: ["active", "invited", "requested"], default: "active", index: true },
  },
  { timestamps: true }
);

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMember = models.GroupMember || model("GroupMember", GroupMemberSchema);

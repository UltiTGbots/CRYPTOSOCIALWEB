import { Schema, model, models, Types } from "mongoose";

const ResetTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", index: true, required: true },
    tokenHash: { type: String, unique: true, required: true },
    expiresAt: { type: Date, index: true, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResetToken = models.ResetToken || model("ResetToken", ResetTokenSchema);

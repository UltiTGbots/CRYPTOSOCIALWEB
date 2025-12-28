import { Schema, model, models, Types } from "mongoose";

const ReelMailViewSchema = new Schema(
  {
    reelMailId: { type: Types.ObjectId, ref: "ReelMail", required: true, index: true },
    viewerUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    rewardedRgc: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ReelMailViewSchema.index({ reelMailId: 1, viewerUserId: 1 }, { unique: true });

export const ReelMailView = models.ReelMailView || model("ReelMailView", ReelMailViewSchema);

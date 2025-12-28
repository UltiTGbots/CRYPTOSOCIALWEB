import { Schema, model, models } from "mongoose";

const AdminConfigSchema = new Schema(
  {
    defaultReelMailSendCostRgc: { type: Number, default: 5 },
    defaultReelMailRewardPerViewRgc: { type: Number, default: 1 },
    defaultReelMailRewardPoolRgc: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const AdminConfig = models.AdminConfig || model("AdminConfig", AdminConfigSchema);

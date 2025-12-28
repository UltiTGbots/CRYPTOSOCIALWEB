import { Schema, model, models } from "mongoose";

const PlatformConfigSchema = new Schema(
  {
    platformFeeBps: { type: Number, default: 100 },
    treasuryAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PlatformConfig = models.PlatformConfig || model("PlatformConfig", PlatformConfigSchema);

import { Schema, model, models, Types } from "mongoose";

const WalletLinkSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    chain: { type: String, enum: ["evm", "solana"], required: true, index: true },
    address: { type: String, required: true, index: true },
    provider: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

WalletLinkSchema.index({ chain: 1, address: 1 }, { unique: true });

export const WalletLink = models.WalletLink || model("WalletLink", WalletLinkSchema);

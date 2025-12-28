import { Schema, model, models } from "mongoose";

const WalletNonceSchema = new Schema(
  {
    nonce: { type: String, unique: true, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

WalletNonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WalletNonce = models.WalletNonce || model("WalletNonce", WalletNonceSchema);

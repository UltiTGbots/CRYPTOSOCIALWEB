import { Schema, model, models, Types } from "mongoose";

const PurchaseSchema = new Schema(
  {
    postId: { type: Types.ObjectId, ref: "Post", required: true, index: true },
    buyerUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    sellerUserId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    priceUsdCents: { type: Number, required: true },
    platformFeeBps: { type: Number, required: true },
    platformFeeUsdCents: { type: Number, required: true },
    sellerNetUsdCents: { type: Number, required: true },
    network: { type: String, default: "" },
    scheme: { type: String, default: "" },
    paymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

PurchaseSchema.index({ postId: 1, buyerUserId: 1 }, { unique: true });

export const Purchase = models.Purchase || model("Purchase", PurchaseSchema);

import { Schema, model, models, Types } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    tier: { type: String, enum: ["FREE","GOLD","BUSINESS"], default: "FREE", index: true },
    stripeCustomerId: { type: String, default: "", index: true },
    stripeSubscriptionId: { type: String, default: "", index: true },
    status: { type: String, default: "inactive", index: true }, // active, trialing, past_due, canceled, etc
    currentPeriodEnd: { type: Date, default: null },
    lastInvoicePaidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Subscription = models.Subscription || model("Subscription", SubscriptionSchema);

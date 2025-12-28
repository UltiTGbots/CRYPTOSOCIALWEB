import { Schema, model, models, Types } from "mongoose";

const CreditLedgerSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    delta: { type: Number, required: true }, // + earn, - spend
    reason: { type: String, required: true, index: true }, // purchase, reelmail_send, reelmail_view_reward, admin_adjust, etc
    refId: { type: String, default: "" }, // e.g. stripe session id, reelmail id
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

CreditLedgerSchema.index({ userId: 1, createdAt: -1 });

export const CreditLedger = models.CreditLedger || model("CreditLedger", CreditLedgerSchema);

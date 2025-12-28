import { Schema, model, models, Types } from "mongoose";

const ReelMailSchema = new Schema(
  {
    senderId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    // optional recipient for direct reelmail; if omitted, it’s feed-wide “sponsored reelmail”
    recipientId: { type: Types.ObjectId, ref: "User", default: null, index: true },

    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["", "image", "video"], default: "" },

    // RGC economics:
    // cost to send/post this reelmail (charged to sender)
    sendCostRgc: { type: Number, default: 0 },
    // reward for each unique viewer who watches the reelmail in the feed
    rewardPerViewRgc: { type: Number, default: 0 },
    // total reward pool funded by sender (decremented as viewers earn)
    rewardPoolRemainingRgc: { type: Number, default: 0 },

    visibility: { type: String, enum: ["inbox", "feed"], default: "feed", index: true },
    status: { type: String, enum: ["draft", "sent"], default: "sent", index: true },
  },
  { timestamps: true }
);

ReelMailSchema.index({ senderId: 1, createdAt: -1 });
ReelMailSchema.index({ recipientId: 1, createdAt: -1 });

export const ReelMail = models.ReelMail || model("ReelMail", ReelMailSchema);

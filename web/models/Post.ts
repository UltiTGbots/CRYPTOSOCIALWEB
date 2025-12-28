import { Schema, model, models, Types } from "mongoose";

const PostSchema = new Schema(
  {
    authorId: { type: Types.ObjectId, ref: "User", index: true, required: true },
    kind: { type: String, enum: ["post", "reel"], default: "post", index: true },
    text: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["", "image", "video"], default: "" },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
// Groups
groupId: { type: Types.ObjectId, ref: "Group", default: null, index: true },

// Paywall (x402)
isPaywalled: { type: Boolean, default: false, index: true },
priceUsdCents: { type: Number, default: 0 },

// Token launch attachment (pump.fun / bonk.fun)
tokenLaunch: {
  platform: { type: String, enum: ["", "pumpfun", "bonkfun"], default: "" },
  mint: { type: String, default: "" },
  txSignature: { type: String, default: "" },
  status: { type: String, enum: ["", "pending", "submitted", "failed"], default: "" },
},

  },
  { timestamps: true }
);

export const Post = models.Post || model("Post", PostSchema);

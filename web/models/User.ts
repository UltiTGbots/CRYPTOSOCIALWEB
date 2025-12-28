import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, index: true },
    name: { type: String },
    email: { type: String, index: true },
    image: { type: String },
    passwordHash: { type: String },
    providers: [{ type: String }],
    isAdmin: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    flags: {
      isBanned: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);

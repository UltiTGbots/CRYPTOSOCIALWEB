import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ResetToken } from "@/models/ResetToken";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import crypto from "crypto";
import argon2 from "argon2";

function sha256(s: string) { return crypto.createHash("sha256").update(s).digest("hex"); }

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "ip").split(",")[0].trim();
  await rateLimitOrThrow(`reset:${ip}`);

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ token: z.string().min(10), newPassword: z.string().min(8) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const tokenHash = sha256(parsed.data.token);

  const rt = await ResetToken.findOne({ tokenHash }).exec();
  if (!rt || rt.usedAt || rt.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await argon2.hash(parsed.data.newPassword);
  await User.updateOne({ _id: rt.userId }, { $set: { passwordHash }, $addToSet: { providers: "credentials" } }).exec();
  rt.usedAt = new Date(); await rt.save();

  return NextResponse.json({ ok: true });
}

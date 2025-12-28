import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { rateLimitOrThrow } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mailer";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { ResetToken } from "@/models/ResetToken";

function sha256(s: string) { return crypto.createHash("sha256").update(s).digest("hex"); }

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "ip").split(",")[0].trim();
  await rateLimitOrThrow(`forgot:${ip}`);

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ type: z.enum(["username","password"]), email: z.string().email() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email }).lean();

  // Always return ok to prevent account enumeration
  if (!user) return NextResponse.json({ ok: true });

  if (parsed.data.type === "username") {
    try { await sendMail(parsed.data.email, "Your ReelTokz username", `<p>Your username is: <b>@${user.username}</b></p>`); } catch {}
    return NextResponse.json({ ok: true });
  }

  const rawToken = nanoid(48);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 1000*60*30);
  await ResetToken.create({ userId: user._id, tokenHash, expiresAt });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
  try {
    await sendMail(parsed.data.email, "Reset your ReelTokz password",
      `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`);
  } catch {}

  return NextResponse.json({ ok: true });
}

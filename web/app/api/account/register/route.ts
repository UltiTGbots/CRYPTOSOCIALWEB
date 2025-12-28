import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { rateLimitOrThrow } from "@/lib/rateLimit";

function normalizeUsername(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);
}

async function ensureUniqueUsername(base: string) {
  let candidate = base || `user_${nanoid(6)}`;
  for (let i = 0; i < 12; i++) {
    const exists = await User.findOne({ username: candidate }).lean();
    if (!exists) return candidate;
    candidate = `${base}_${nanoid(4)}`.slice(0, 24);
  }
  return `user_${nanoid(10)}`.slice(0, 24);
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "ip").split(",")[0].trim();
  await rateLimitOrThrow(`register:${ip}`);

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3).max(24).optional(),
    name: z.string().min(1).max(60).optional(),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();

  const existing = await User.findOne({ email: parsed.data.email }).lean();
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const usernameBase = normalizeUsername(parsed.data.username || parsed.data.email.split("@")[0]);
  const username = await ensureUniqueUsername(usernameBase);
  const passwordHash = await argon2.hash(parsed.data.password);

  const user = await User.create({
    email: parsed.data.email,
    username,
    name: parsed.data.name || username,
    passwordHash,
    providers: ["credentials"],
  });

  return NextResponse.json({ ok: true, userId: String(user._id), username });
}

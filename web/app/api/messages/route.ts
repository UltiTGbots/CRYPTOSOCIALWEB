import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { rateLimitOrThrow } from "@/lib/rateLimit";

function roomIdFor(a: string, b: string) { return [a, b].sort().join(":"); }

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId") || "";
  if (!roomId) return NextResponse.json({ items: [] });

  const items = await Message.find({ roomId }).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ items: items.reverse() });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = (req.headers.get("x-forwarded-for") || "ip").split(",")[0].trim();
  await rateLimitOrThrow(`msg:${ip}`);

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ toUsername: z.string().min(3).max(24), text: z.string().min(1).max(2000) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const fromUserId = (session as any).userId as string;
  const to = await User.findOne({ username: parsed.data.toUsername.toLowerCase() }).lean();
  if (!to) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const roomId = roomIdFor(fromUserId, String(to._id));
  const msg = await Message.create({ roomId, fromUserId, toUserId: to._id, text: parsed.data.text });

  return NextResponse.json({ ok: true, roomId, message: msg });
}

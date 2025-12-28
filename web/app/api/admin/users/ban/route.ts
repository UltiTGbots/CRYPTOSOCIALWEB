import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ userId: z.string().min(10), banned: z.boolean() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  await User.updateOne({ _id: parsed.data.userId }, { $set: { "flags.isBanned": parsed.data.banned } }).exec();
  return NextResponse.json({ ok: true });
}

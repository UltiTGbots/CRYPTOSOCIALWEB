import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { PlatformConfig } from "@/models/PlatformConfig";

export async function GET() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const cfg = (await PlatformConfig.findOne({}).lean()) || { platformFeeBps: 100, treasuryAddress: "" };
  return NextResponse.json({ cfg });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    platformFeeBps: z.number().int().min(0).max(1000),
    treasuryAddress: z.string().max(200).optional().default(""),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  await PlatformConfig.updateOne({}, { $set: parsed.data }, { upsert: true }).exec();
  return NextResponse.json({ ok: true });
}

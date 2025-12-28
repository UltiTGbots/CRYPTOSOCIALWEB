import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { AdminConfig } from "@/models/AdminConfig";

export async function GET() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await dbConnect();
  const cfg = (await AdminConfig.findOne({}).lean()) || { defaultReelMailSendCostRgc: 5, defaultReelMailRewardPerViewRgc: 1, defaultReelMailRewardPoolRgc: 100 };
  return NextResponse.json({ cfg });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    defaultReelMailSendCostRgc: z.number().int().min(0).max(100000),
    defaultReelMailRewardPerViewRgc: z.number().int().min(0).max(10000),
    defaultReelMailRewardPoolRgc: z.number().int().min(0).max(200000),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  await AdminConfig.updateOne({}, { $set: parsed.data }, { upsert: true }).exec();
  return NextResponse.json({ ok: true });
}

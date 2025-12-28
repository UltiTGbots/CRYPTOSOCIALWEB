import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { ReelMail } from "@/models/ReelMail";
import { addRgc } from "@/lib/rgc";
import { User } from "@/models/User";
import { ensureFreeMonthlyGrant } from "@/lib/grants";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureFreeMonthlyGrant(senderId);

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const box = searchParams.get("box") || "feed"; // feed or inbox
  const limit = Math.min(Number(searchParams.get("limit") || "30"), 50);

  const userId = String((session as any).userId);
  const q: any = { visibility: box === "inbox" ? "inbox" : "feed" };
  if (box === "inbox") q.recipientId = userId;

  const items = await ReelMail.find(q).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    visibility: z.enum(["feed","inbox"]).optional().default("feed"),
    recipientUsername: z.string().optional().default(""),
    subject: z.string().max(200).optional().default(""),
    body: z.string().max(8000).optional().default(""),
    mediaUrl: z.string().optional().default(""),
    mediaType: z.enum(["","image","video"]).optional().default(""),
    sendCostRgc: z.number().int().min(0).max(100000).optional().default(0),
    rewardPerViewRgc: z.number().int().min(0).max(10000).optional().default(0),
    rewardPoolRgc: z.number().int().min(0).max(200000).optional().default(0),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await ensureFreeMonthlyGrant(senderId);

  await dbConnect();
  const senderId = String((session as any).userId);

  let recipientId: any = null;
  if (parsed.data.visibility === "inbox") {
    if (!parsed.data.recipientUsername) return NextResponse.json({ error: "Recipient required" }, { status: 400 });
    const u = await User.findOne({ username: parsed.data.recipientUsername.replace(/^@/,"") }).lean();
    if (!u) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    recipientId = u._id;
  }

  // Charge sender RGC to send/post ReelMail.
  // Also lock reward pool in the ReelMail (funded by sender).
  const totalCost = parsed.data.sendCostRgc + parsed.data.rewardPoolRgc;
  if (totalCost > 0) {
    try {
      await addRgc(senderId, -totalCost, "reelmail_send", "", { sendCostRgc: parsed.data.sendCostRgc, rewardPoolRgc: parsed.data.rewardPoolRgc });
    } catch {
      return NextResponse.json({ error: "Insufficient RGC. Buy more credits." }, { status: 402 });
    }
  }

  const rm = await ReelMail.create({
    senderId,
    recipientId,
    subject: parsed.data.subject,
    body: parsed.data.body,
    mediaUrl: parsed.data.mediaUrl,
    mediaType: parsed.data.mediaType,
    sendCostRgc: parsed.data.sendCostRgc,
    rewardPerViewRgc: parsed.data.rewardPerViewRgc,
    rewardPoolRemainingRgc: parsed.data.rewardPoolRgc,
    visibility: parsed.data.visibility,
    status: "sent",
  });

  return NextResponse.json({ ok: true, reelMailId: String(rm._id) });
}

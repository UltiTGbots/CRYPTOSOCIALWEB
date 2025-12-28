import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { ReelMail } from "@/models/ReelMail";
import { ReelMailView } from "@/models/ReelMailView";
import { addRgc } from "@/lib/rgc";
import { ensureFreeMonthlyGrant } from "@/lib/grants";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const viewerId = String((session as any).userId);

  await ensureFreeMonthlyGrant(viewerId);

  await dbConnect();
  const rm = await ReelMail.findById(params.id).exec();
  if (!rm) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only reward first unique view
  const existing = await ReelMailView.findOne({ reelMailId: rm._id, viewerUserId: viewerId }).lean();
  if (existing) return NextResponse.json({ ok: true, rewarded: 0 });

  let reward = Number(rm.rewardPerViewRgc || 0);
  if (reward > 0 && Number(rm.rewardPoolRemainingRgc || 0) <= 0) reward = 0;
  if (reward > Number(rm.rewardPoolRemainingRgc || 0)) reward = Number(rm.rewardPoolRemainingRgc || 0);

  await ReelMailView.create({ reelMailId: rm._id, viewerUserId: viewerId, rewardedRgc: reward });

  if (reward > 0) {
    rm.rewardPoolRemainingRgc = Number(rm.rewardPoolRemainingRgc || 0) - reward;
    await rm.save();
    await addRgc(viewerId, reward, "reelmail_view_reward", String(rm._id), { reward });
  }

  return NextResponse.json({ ok: true, rewarded: reward });
}

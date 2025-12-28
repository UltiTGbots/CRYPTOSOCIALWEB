import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Group } from "@/models/Group";
import { GroupMember } from "@/models/GroupMember";

export async function POST(req: Request, { params }: { params: { handle: string } }) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    targetUserId: z.string().min(10),
    action: z.enum(["approve", "reject", "promote", "demote", "remove"]),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const group = await Group.findOne({ handle: params.handle.toLowerCase() }).exec();
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const actor = await GroupMember.findOne({ groupId: group._id, userId: (session as any).userId }).lean();
  if (!actor || (actor.role !== "owner" && actor.role !== "admin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await GroupMember.findOne({ groupId: group._id, userId: parsed.data.targetUserId }).exec();
  if (!target) return NextResponse.json({ error: "Target not found" }, { status: 404 });
  if (target.role === "owner") return NextResponse.json({ error: "Cannot modify owner" }, { status: 400 });

  if (parsed.data.action === "approve") {
    if (target.status === "requested") {
      target.status = "active";
      await target.save();
      await Group.updateOne({ _id: group._id }, { $inc: { membersCount: 1 } }).exec();
    }
  } else if (parsed.data.action === "reject") {
    await GroupMember.deleteOne({ _id: target._id }).exec();
  } else if (parsed.data.action === "remove") {
    await GroupMember.deleteOne({ _id: target._id }).exec();
    if (target.status === "active") await Group.updateOne({ _id: group._id }, { $inc: { membersCount: -1 } }).exec();
  } else if (parsed.data.action === "promote") {
    if (actor.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
    target.role = "admin";
    target.status = "active";
    await target.save();
  } else if (parsed.data.action === "demote") {
    if (actor.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
    target.role = "member";
    await target.save();
  }

  return NextResponse.json({ ok: true });
}

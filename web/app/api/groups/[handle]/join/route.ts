import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Group } from "@/models/Group";
import { GroupMember } from "@/models/GroupMember";

export async function POST(_req: Request, { params }: { params: { handle: string } }) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const group = await Group.findOne({ handle: params.handle.toLowerCase() }).exec();
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = (session as any).userId;
  const existing = await GroupMember.findOne({ groupId: group._id, userId }).lean();
  if (existing?.status === "active") return NextResponse.json({ ok: true, status: "active" });

  if (group.isPrivate) {
    await GroupMember.updateOne(
      { groupId: group._id, userId },
      { $set: { status: "requested", role: "member" } },
      { upsert: true }
    ).exec();
    return NextResponse.json({ ok: true, status: "requested" });
  }

  await GroupMember.updateOne(
    { groupId: group._id, userId },
    { $set: { status: "active", role: "member" } },
    { upsert: true }
  ).exec();
  await Group.updateOne({ _id: group._id }, { $inc: { membersCount: 1 } }).exec();

  return NextResponse.json({ ok: true, status: "active" });
}

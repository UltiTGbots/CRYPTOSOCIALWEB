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
  const m = await GroupMember.findOne({ groupId: group._id, userId }).lean();
  if (!m) return NextResponse.json({ ok: true });

  if (m.role === "owner") return NextResponse.json({ error: "Owner cannot leave" }, { status: 400 });

  await GroupMember.deleteOne({ groupId: group._id, userId }).exec();
  await Group.updateOne({ _id: group._id }, { $inc: { membersCount: -1 } }).exec();
  return NextResponse.json({ ok: true });
}

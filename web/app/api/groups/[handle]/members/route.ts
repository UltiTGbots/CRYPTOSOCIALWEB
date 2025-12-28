import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Group } from "@/models/Group";
import { GroupMember } from "@/models/GroupMember";
import { User } from "@/models/User";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const group = await Group.findOne({ handle: params.handle.toLowerCase() }).lean();
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const viewer = await GroupMember.findOne({ groupId: group._id, userId: (session as any).userId }).lean();
  if (!viewer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await GroupMember.find({ groupId: group._id, status: { $in: ["active", "requested"] } }).sort({ role: 1, createdAt: 1 }).lean();
  const userIds = members.map((m: any) => m.userId);
  const users = await User.find({ _id: { $in: userIds } }).select({ username: 1, name: 1, image: 1 }).lean();
  const map = new Map(users.map((u: any) => [String(u._id), u]));
  const items = members.map((m: any) => ({ ...m, user: map.get(String(m.userId)) }));

  return NextResponse.json({ items, viewerRole: viewer.role });
}

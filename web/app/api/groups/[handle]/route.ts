import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Group } from "@/models/Group";
import { GroupMember } from "@/models/GroupMember";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const session = await auth();
  await dbConnect();

  const handle = params.handle.toLowerCase();
  const group = await Group.findOne({ handle }).lean();
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const viewerId = (session as any)?.userId;
  const membership = viewerId ? await GroupMember.findOne({ groupId: group._id, userId: viewerId }).lean() : null;

  if (group.isPrivate && !membership) return NextResponse.json({ error: "Private group" }, { status: 403 });

  return NextResponse.json({ group, membership });
}

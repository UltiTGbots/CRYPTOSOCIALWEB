import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { Group } from "@/models/Group";
import { GroupMember } from "@/models/GroupMember";

function normHandle(h: string) {
  return h.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit") || "30"), 50);
  const filter: any = {};
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { handle: new RegExp(q, "i") }];
  const groups = await Group.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    name: z.string().min(3).max(60),
    handle: z.string().min(3).max(24),
    description: z.string().max(3000).optional().default(""),
    isPrivate: z.boolean().optional().default(false),
    avatarUrl: z.string().url().optional().default(""),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
const userId = String((session as any).userId);
const user = await User.findById(userId).select({ accountTier: 1 }).lean();
const tier = (user?.accountTier as any) || "FREE";

// Private groups are a paid feature in the mobile packages.
if (parsed.data.isPrivate) {
  const max = (PACKAGES as any)[tier]?.privateGroupMaxMembers || 0;
  if (max <= 0) return NextResponse.json({ error: "Upgrade required to create private groups." }, { status: 402 });
}

  const handle = normHandle(parsed.data.handle);

  const group = await Group.create({
    name: parsed.data.name,
    handle,
    description: parsed.data.description,
    isPrivate: parsed.data.isPrivate,
    maxMembers: parsed.data.isPrivate ? ((PACKAGES as any)[tier]?.privateGroupMaxMembers || 0) : 0,
    avatarUrl: parsed.data.avatarUrl,
    ownerId: (session as any).userId,
    membersCount: 1,
  });

  await GroupMember.create({ groupId: group._id, userId: (session as any).userId, role: "owner", status: "active" });

  return NextResponse.json({ ok: true, groupId: String(group._id), handle: group.handle });
}

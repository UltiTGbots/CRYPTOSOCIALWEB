import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { auth } from "@/lib/auth";
import { rateLimitOrThrow } from "@/lib/rateLimit";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const kind = searchParams.get("kind") || "post";
  const groupHandle = (searchParams.get("group") || "").trim();
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);

  const query: any = { kind };
  if (groupHandle) {
    const { Group } = await import("@/models/Group");
    const g = await Group.findOne({ handle: groupHandle.toLowerCase() }).lean();
    if (!g) return NextResponse.json({ items: [], nextCursor: null });
    query.groupId = g._id;
  }

  if (cursor) query._id = { $lt: cursor };

  const items = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .lean();

  const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : null;
  return NextResponse.json({ items, nextCursor });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await rateLimitOrThrow({ req, keyPrefix: "posts:create:" + (session as any).userId });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    kind: z.string().optional().default("post"),
    text: z.string().max(5000).optional().default(""),
    mediaUrl: z.string().url().optional().default(""),
    mediaType: z.enum(["", "image", "video"]).optional().default(""),
    groupHandle: z.string().max(24).optional().default(""),
    isPaywalled: z.boolean().optional().default(false),
    priceUsdCents: z.number().int().min(0).max(500000).optional().default(0),
    tokenLaunch: z
      .object({
        platform: z.enum(["", "pumpfun", "bonkfun"]).optional().default(""),
        status: z.enum(["", "pending", "submitted", "failed"]).optional().default("pending"),
      })
      .optional(),
  }).safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();

  let groupId: any = null;
  if (parsed.data.groupHandle) {
    const { Group } = await import("@/models/Group");
    const g = await Group.findOne({ handle: parsed.data.groupHandle.toLowerCase() }).lean();
    if (g) groupId = g._id;
  }

  const doc = await Post.create({
    authorId: (session as any).userId,
    kind: parsed.data.kind,
    text: parsed.data.text,
    mediaUrl: parsed.data.mediaUrl,
    mediaType: parsed.data.mediaType,
    groupId,
    isPaywalled: parsed.data.isPaywalled,
    priceUsdCents: parsed.data.isPaywalled ? parsed.data.priceUsdCents : 0,
    tokenLaunch: parsed.data.tokenLaunch?.platform
      ? { platform: parsed.data.tokenLaunch.platform, status: parsed.data.tokenLaunch.status }
      : undefined,
  });

  return NextResponse.json({ ok: true, post: doc });
}

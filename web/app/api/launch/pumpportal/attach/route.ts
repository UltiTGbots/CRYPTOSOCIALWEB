import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    postId: z.string().min(10),
    platform: z.enum(["pumpfun", "bonkfun"]),
    mint: z.string().min(10),
    txSignature: z.string().min(10),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const post = await Post.findById(parsed.data.postId).exec();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(post.authorId) !== String((session as any).userId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  post.tokenLaunch = { platform: parsed.data.platform, mint: parsed.data.mint, txSignature: parsed.data.txSignature, status: "submitted" } as any;
  await post.save();
  return NextResponse.json({ ok: true });
}

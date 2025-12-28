import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { auth } from "@/lib/auth";
import { Purchase } from "@/models/Purchase";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  await dbConnect();
  const post = await Post.findById(params.id).lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!post.isPaywalled || post.priceUsdCents <= 0) return NextResponse.json({ post });

  const viewerId = (session as any)?.userId;
  if (viewerId && String(post.authorId) === String(viewerId)) return NextResponse.json({ post });

  const hasPurchase = viewerId ? await Purchase.findOne({ postId: post._id, buyerUserId: viewerId }).lean() : null;
  if (hasPurchase) return NextResponse.json({ post });

  return NextResponse.json({ error: "Payment required", paywalled: true, paywallUrl: `/p/${post._id}` }, { status: 402 });
}

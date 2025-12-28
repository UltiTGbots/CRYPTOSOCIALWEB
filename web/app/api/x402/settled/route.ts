import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Purchase } from "@/models/Purchase";
import { PlatformConfig } from "@/models/PlatformConfig";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const postId = body.postId as string | undefined;
  const buyerUserId = body.buyerUserId as string | undefined;
  const paymentId = body.paymentId as string | undefined;

  if (!postId || !buyerUserId || !paymentId) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await dbConnect();
  const post = await Post.findById(postId).lean();
  if (!post || !post.isPaywalled) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cfg = (await PlatformConfig.findOne({}).lean()) || { platformFeeBps: 100 };
  const price = Number(post.priceUsdCents || 0);
  const feeBps = Number(cfg.platformFeeBps || 0);
  const fee = Math.floor((price * feeBps) / 10000);
  const net = price - fee;

  await Purchase.updateOne(
    { postId, buyerUserId },
    {
      $setOnInsert: {
        postId,
        buyerUserId,
        sellerUserId: post.authorId,
        priceUsdCents: price,
        platformFeeBps: feeBps,
        platformFeeUsdCents: fee,
        sellerNetUsdCents: net,
        scheme: body.scheme || "",
        network: body.network || "",
        paymentId,
      },
    },
    { upsert: true }
  ).exec();

  return NextResponse.json({ ok: true });
}

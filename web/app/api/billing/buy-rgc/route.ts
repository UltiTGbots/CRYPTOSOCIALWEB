import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { dbConnect } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";

/**
 * Mirrors original "COINS" package: one-time purchase that adds +20 RGC.
 */
export async function POST() {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const priceId = env.STRIPE_PRICE_COINS;
  if (!priceId) return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });

  await dbConnect();
  const userId = String((session as any).userId);
  let sub = await Subscription.findOne({ userId }).exec();
  if (!sub) sub = await Subscription.create({ userId, tier: "FREE" });

  if (!sub.stripeCustomerId) {
    const customer = await stripe.customers.create({ metadata: { userId } });
    sub.stripeCustomerId = customer.id;
    await sub.save();
  }

  const appUrl = env.APP_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: sub.stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing/cancel`,
    metadata: { userId, kind: "coins" },
  });

  return NextResponse.json({ url: checkout.url });
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { dbConnect } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";
import { addRgc } from "@/lib/rgc";
import { PACKAGES } from "@/lib/packages";

export const runtime = "nodejs";

async function readRawBody(req: Request) {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const buf = await readRawBody(req);
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET || "");
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  await dbConnect();

  // Checkout completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const kind = session.metadata?.kind;

    if (userId && kind === "subscription") {
      const pkg = session.metadata?.package || "GOLD";

      await Subscription.updateOne(
        { userId },
        {
          $set: {
            tier: pkg,
            stripeCustomerId: session.customer || "",
            stripeSubscriptionId: session.subscription || "",
            status: "active",
          },
        },
        { upsert: true }
      ).exec();

      await User.updateOne({ _id: userId }, { $set: { accountTier: pkg } }).exec();

      // One-time bonus coins "to try before you buy"
      const bonus = (PACKAGES as any)[pkg]?.signupBonusRgc || 0;
      if (bonus > 0) await addRgc(userId, bonus, "tier_start_bonus", session.id, { pkg });
    }

    if (userId && kind === "coins") {
      // One-time COINS purchase adds +20 RGC (matches original backend)
      const amt = PACKAGES.COINS.purchaseRgc || 20;
      await addRgc(userId, amt, "purchase_coins", session.id, { kind: "COINS", stripeSessionId: session.id });
    }
  }

  // Subscription status updates
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subObj = event.data.object as any;
    const stripeSubId = subObj.id;
    const status = subObj.status;
    const currentPeriodEnd = subObj.current_period_end ? new Date(subObj.current_period_end * 1000) : null;

    const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSubId }).exec();
    if (sub) {
      sub.status = status;
      sub.currentPeriodEnd = currentPeriodEnd;
      if (status !== "active" && status !== "trialing") sub.tier = "FREE";
      await sub.save();
      await User.updateOne({ _id: sub.userId }, { $set: { accountTier: sub.tier } }).exec();
    }
  }

  // Monthly coin grants on renewal (mirrors original +20 GOLD, +50 BUSINESS)
  if (event.type === "invoice.paid") {
    const inv = event.data.object as any;
    const customerId = inv.customer;
    const subId = inv.subscription;

    const sub = await Subscription.findOne({ stripeCustomerId: customerId, stripeSubscriptionId: subId }).exec();
    if (sub && (sub.tier === "GOLD" || sub.tier === "BUSINESS")) {
      const monthly = (PACKAGES as any)[sub.tier]?.monthlyRgc || 0;
      if (monthly > 0) {
        await addRgc(String(sub.userId), monthly, "monthly_grant_paid", inv.id, { tier: sub.tier });
        sub.lastInvoicePaidAt = new Date();
        await sub.save();
      }
    }
  }

  return NextResponse.json({ received: true });
}

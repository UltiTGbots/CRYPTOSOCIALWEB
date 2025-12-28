import { NextResponse } from "next/server";
import { z } from "zod";
import { SiweMessage } from "siwe";
import { dbConnect } from "@/lib/mongoose";
import { WalletNonce } from "@/models/WalletNonce";
import { WalletLink } from "@/models/WalletLink";
import { auth } from "@/lib/auth";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    message: z.string().min(10),
    signature: z.string().min(10),
    provider: z.string().optional().default(""),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const siwe = new SiweMessage(parsed.data.message);
  const fields = await siwe.verify({ signature: parsed.data.signature });
  if (!fields.success) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const nonceDoc = await WalletNonce.findOne({ nonce: siwe.nonce }).lean();
  if (!nonceDoc || nonceDoc.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Expired nonce" }, { status: 401 });

  const address = siwe.address.toLowerCase();

  let userId = (session as any)?.userId;

  if (!userId) {
    const existing = await WalletLink.findOne({ chain: "evm", address }).lean();
    if (existing) userId = String(existing.userId);
    else {
      const username = `evm_${address.slice(2, 10)}`;
      const u = await User.create({ username, name: username, providers: ["wallet"] });
      userId = String(u._id);
    }
  }

  await WalletLink.updateOne(
    { chain: "evm", address },
    { $set: { userId, chain: "evm", address, provider: parsed.data.provider, verifiedAt: new Date() } },
    { upsert: true }
  ).exec();

  return NextResponse.json({ ok: true, address, userId });
}

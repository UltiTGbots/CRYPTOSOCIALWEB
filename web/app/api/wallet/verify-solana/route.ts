import { NextResponse } from "next/server";
import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { dbConnect } from "@/lib/mongoose";
import { WalletNonce } from "@/models/WalletNonce";
import { WalletLink } from "@/models/WalletLink";
import { auth } from "@/lib/auth";
import { User } from "@/models/User";

function utf8ToBytes(s: string) {
  return new TextEncoder().encode(s);
}

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    address: z.string().min(20),
    message: z.string().min(10),
    signatureBase58: z.string().min(10),
    provider: z.string().optional().default(""),
    nonce: z.string().min(8),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const nonceDoc = await WalletNonce.findOne({ nonce: parsed.data.nonce }).lean();
  if (!nonceDoc || nonceDoc.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "Expired nonce" }, { status: 401 });

  const sig = bs58.decode(parsed.data.signatureBase58);
  const msg = utf8ToBytes(parsed.data.message);
  const pub = bs58.decode(parsed.data.address);

  const ok = nacl.sign.detached.verify(msg, sig, pub);
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let userId = (session as any)?.userId;
  if (!userId) {
    const existing = await WalletLink.findOne({ chain: "solana", address: parsed.data.address }).lean();
    if (existing) userId = String(existing.userId);
    else {
      const username = `sol_${parsed.data.address.slice(0, 6)}${parsed.data.address.slice(-4)}`.toLowerCase();
      const u = await User.create({ username, name: username, providers: ["wallet"] });
      userId = String(u._id);
    }
  }

  await WalletLink.updateOne(
    { chain: "solana", address: parsed.data.address },
    { $set: { userId, chain: "solana", address: parsed.data.address, provider: parsed.data.provider, verifiedAt: new Date() } },
    { upsert: true }
  ).exec();

  return NextResponse.json({ ok: true, address: parsed.data.address, userId });
}

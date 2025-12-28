import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { WalletNonce } from "@/models/WalletNonce";
import { randomNonce } from "@/lib/crypto";

export async function GET() {
  await dbConnect();
  const nonce = randomNonce(16);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  await WalletNonce.create({ nonce, expiresAt });
  return NextResponse.json({ nonce, expiresAt });
}

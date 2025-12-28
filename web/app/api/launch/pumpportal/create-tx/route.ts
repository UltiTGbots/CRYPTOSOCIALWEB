import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    platform: z.enum(["pumpfun", "bonkfun"]),
    publicKey: z.string().min(20),
    tokenMetadata: z.object({ name: z.string().min(1), symbol: z.string().min(1), uri: z.string().min(5) }),
    denominatedInSol: z.string().optional().default("true"),
    amount: z.number().min(0),
    slippage: z.number().min(0).max(100),
    priorityFee: z.number().min(0),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { Keypair } = await import("@solana/web3.js");
  const mint = Keypair.generate();
  const pool = parsed.data.platform === "pumpfun" ? "pump" : "bonk";

  const resp = await fetch("https://pumpportal.fun/api/trade-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: parsed.data.publicKey,
      action: "create",
      tokenMetadata: parsed.data.tokenMetadata,
      mint: mint.publicKey.toBase58(),
      denominatedInSol: parsed.data.denominatedInSol,
      amount: parsed.data.amount,
      slippage: parsed.data.slippage,
      priorityFee: parsed.data.priorityFee,
      pool,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text().catch(() => "");
    return NextResponse.json({ error: "PumpPortal trade-local failed", detail: t.slice(0, 500) }, { status: 502 });
  }

  const buf = new Uint8Array(await resp.arrayBuffer());
  const txBase64 = __btoaBytes(buf);
  return NextResponse.json({ txBase64, mint: mint.publicKey.toBase58(), rpcUrl: env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com" });
}

function __btoaBytes(buf: Uint8Array) {
  let bin = "";
  for (const b of buf) bin += String.fromCharCode(b);
  // @ts-ignore
  return Buffer.from(bin, "binary").toString("base64");
}

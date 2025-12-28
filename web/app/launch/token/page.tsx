"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import bs58 from "bs58";

export default function TokenLaunch() {
  const sp = useSearchParams();
  const router = useRouter();
  const postId = sp.get("postId") || "";
  const platform = (sp.get("platform") || "pumpfun") as "pumpfun" | "bonkfun";

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [devBuySol, setDevBuySol] = useState(1);
  const [slippage, setSlippage] = useState(10);
  const [priorityFee, setPriorityFee] = useState(0.0005);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function connectSolana() {
    const provider = (window as any).solana || (window as any).solflare;
    if (!provider) throw new Error("No Solana wallet found");
    await provider.connect();
    return provider.publicKey?.toString?.() || provider.publicKey?.toBase58?.();
  }

  async function submit() {
    setMsg(null);
    setBusy(true);
    try {
      const pubkey = await connectSolana();
      if (!pubkey) throw new Error("Wallet not connected");
      if (!imageFile) throw new Error("Please select an image");

      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("name", name);
      fd.append("symbol", symbol);
      fd.append("description", description);
      fd.append("twitter", twitter);
      fd.append("telegram", telegram);
      fd.append("website", website);
      fd.append("showName", "true");

      const metaRes = await fetch("https://pump.fun/api/ipfs", { method: "POST", body: fd });
      if (!metaRes.ok) throw new Error("Metadata upload failed");
      const meta = await metaRes.json();

      const r = await fetch("/api/launch/pumpportal/create-tx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          platform,
          publicKey: pubkey,
          tokenMetadata: { name: meta.metadata.name, symbol: meta.metadata.symbol, uri: meta.metadataUri },
          denominatedInSol: "true",
          amount: devBuySol,
          slippage,
          priorityFee,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to create tx");

      const { VersionedTransaction, Connection } = await import("@solana/web3.js");
      const conn = new Connection(j.rpcUrl, "confirmed");
      const txBytes = Uint8Array.from(atob(j.txBase64), (c) => c.charCodeAt(0));
      const tx = VersionedTransaction.deserialize(txBytes);

      const provider = (window as any).solana || (window as any).solflare;
      const signed = await provider.signTransaction(tx);
      const sig = await conn.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      await conn.confirmTransaction(sig, "confirmed");

      if (postId) {
        await fetch("/api/launch/pumpportal/attach", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ postId, platform, txSignature: sig, mint: j.mint }),
        });
      }

      setMsg(`Submitted! Tx: ${sig}`);
      router.push("/feed");
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-4">
      <h2 className="text-2xl font-extrabold">Launch token on {platform === "pumpfun" ? "pump.fun" : "bonk.fun"}</h2>
      <p className="text-sm text-white/70">
        Wizard mirrors the typical creation steps and uses PumpPortal's Local Transaction API under the hood.
      </p>

      <div className="grid gap-3">
        <label className="text-sm">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} />
        <label className="text-sm">Symbol</label><Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        <label className="text-sm">Description</label>
        <textarea className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-flagBlue min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        <label className="text-sm">Twitter URL</label><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/..." />
        <label className="text-sm">Telegram URL</label><Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/..." />
        <label className="text-sm">Website</label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />

        <label className="text-sm">Token image</label>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm" />

        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm">Dev buy (SOL)</label><Input type="number" step="0.01" value={String(devBuySol)} onChange={(e) => setDevBuySol(Number(e.target.value || 0))} /></div>
          <div><label className="text-sm">Slippage %</label><Input type="number" value={String(slippage)} onChange={(e) => setSlippage(Number(e.target.value || 0))} /></div>
          <div><label className="text-sm">Priority fee</label><Input type="number" step="0.0001" value={String(priorityFee)} onChange={(e) => setPriorityFee(Number(e.target.value || 0))} /></div>
        </div>
      </div>

      <Button onClick={submit} disabled={busy || !name || !symbol || !imageFile}>Create & Launch</Button>
      {msg && <div className="text-sm text-white/80">{msg}</div>}
      <div className="text-xs text-white/50">
        Requires a Solana wallet supporting <code>signTransaction</code> (Phantom / Solflare).
      </div>
    </div>
  );
}

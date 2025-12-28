"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ComposePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const group = sp.get("group") || "";

  const [text, setText] = useState("");
  const [isPaywalled, setIsPaywalled] = useState(false);
  const [price, setPrice] = useState(0);
  const [attachLaunch, setAttachLaunch] = useState(false);
  const [launchPlatform, setLaunchPlatform] = useState<"" | "pumpfun" | "bonkfun">("pumpfun");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind: "post",
        text,
        groupHandle: group,
        isPaywalled,
        priceUsdCents: isPaywalled ? Math.round(price * 100) : 0,
        tokenLaunch: attachLaunch ? { platform: launchPlatform, status: "pending" } : undefined,
      }),
    });
    const j = await res.json();
    if (!res.ok) return setMsg(j.error || "Failed");

    if (attachLaunch) router.push(`/launch/token?postId=${encodeURIComponent(j.post?._id || j._id || "")}&platform=${launchPlatform}`);
    else router.push(group ? `/groups/${group}` : "/feed");
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-4">
      <h2 className="text-2xl font-extrabold">Create post</h2>
      {group && <div className="text-sm text-white/70">Posting to group: <b>@{group}</b></div>}
      <textarea className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-flagBlue min-h-[180px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="What's happening?" />

      <div className="rounded-3xl border border-white/10 bg-black/30 p-4 grid gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPaywalled} onChange={(e) => setIsPaywalled(e.target.checked)} />
          Paywall this post using x402
        </label>
        {isPaywalled && (
          <div className="grid gap-2">
            <label className="text-sm">Price (USD)</label>
            <Input type="number" step="0.01" value={String(price)} onChange={(e) => setPrice(Number(e.target.value || 0))} />
            <div className="text-xs text-white/60">Platform fee configurable in Admin → Monetization (default 1%).</div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-4 grid gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={attachLaunch} onChange={(e) => setAttachLaunch(e.target.checked)} />
          Attach a token launch (pump.fun / bonk.fun) to this post
        </label>
        {attachLaunch && (
          <div className="flex gap-2">
            <Button variant={launchPlatform === "pumpfun" ? "primary" : "ghost"} onClick={() => setLaunchPlatform("pumpfun")}>pump.fun</Button>
            <Button variant={launchPlatform === "bonkfun" ? "primary" : "ghost"} onClick={() => setLaunchPlatform("bonkfun")}>bonk.fun</Button>
          </div>
        )}
      </div>

      <Button onClick={submit} disabled={!text}>Post</Button>
      {msg && <div className="text-sm text-white/80">{msg}</div>}
    </div>
  );
}

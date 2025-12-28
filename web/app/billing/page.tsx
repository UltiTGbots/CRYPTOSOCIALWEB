"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/plans").then((r) => r.json()).then(setData);
  }, []);

  async function subscribe(pkg: "GOLD" | "BUSINESS") {
    setMsg(null);
    const r = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ package: pkg }),
    });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error || "Failed");
    window.location.href = j.url;
  }

  async function buyCoins() {
    setMsg(null);
    const r = await fetch("/api/billing/buy-rgc", { method: "POST" });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error || "Failed");
    window.location.href = j.url;
  }

  const pkgs = data?.packages || [];
  const byId = (id: string) => pkgs.find((p: any) => p.id === id);

  const free = byId("FREE");
  const gold = byId("GOLD");
  const biz = byId("BUSINESS");
  const coins = byId("COINS");

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-extrabold">Packages</h2>
        <div className="text-sm text-white/70 mt-1">Mirrors the mobile Packages screen (names, prices, perks).</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[free, gold, biz].filter(Boolean).map((p: any) => (
          <div key={p.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xl font-extrabold">{p.name}</div>
            <div className="text-white/70 text-sm mt-1">{p.monthlyUsd ? `$${p.monthlyUsd}/mo` : "$0"}</div>
            <ul className="mt-4 text-sm text-white/70 space-y-2">
              {(p.perks || []).map((x: string) => <li key={x}>• {x}</li>)}
            </ul>
            {p.id === "GOLD" && <Button className="mt-5 w-full" onClick={() => subscribe("GOLD")}>Subscribe</Button>}
            {p.id === "BUSINESS" && <Button className="mt-5 w-full" onClick={() => subscribe("BUSINESS")}>Subscribe</Button>}
          </div>
        ))}
      </div>

      {coins && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-xl font-extrabold">{coins.name}</div>
          <div className="text-white/70 text-sm mt-1">${coins.oneTimeUsd} one-time</div>
          <ul className="mt-4 text-sm text-white/70 space-y-2">
            {(coins.perks || []).map((x: string) => <li key={x}>• {x}</li>)}
            <li>• Adds +{coins.purchaseRgc} RGC to your wallet</li>
          </ul>
          <Button className="mt-5" onClick={buyCoins}>Buy Coins</Button>
        </div>
      )}

      {msg && <div className="text-sm text-white/80">{msg}</div>}
      <div className="text-xs text-white/50">
        Stripe webhook endpoint: <code>/api/billing/stripe-webhook</code> (include <code>invoice.paid</code>)
      </div>
    </div>
  );
}

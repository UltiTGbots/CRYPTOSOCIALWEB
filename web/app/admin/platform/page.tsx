"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminPlatform() {
  const [feeBps, setFeeBps] = useState(100);
  const [treasury, setTreasury] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/platform");
    const j = await r.json();
    if (r.ok) {
      setFeeBps(j.cfg?.platformFeeBps ?? 100);
      setTreasury(j.cfg?.treasuryAddress ?? "");
    } else setMsg(j.error || "Forbidden");
  }

  async function save() {
    setMsg(null);
    const r = await fetch("/api/admin/platform", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platformFeeBps: feeBps, treasuryAddress: treasury }),
    });
    const j = await r.json();
    setMsg(r.ok ? "Saved" : (j.error || "Failed"));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Monetization</h2>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-3 max-w-xl">
        <label className="text-sm">Platform fee (bps)</label>
        <Input type="number" value={String(feeBps)} onChange={(e) => setFeeBps(Number(e.target.value || 0))} />
        <div className="text-xs text-white/60">100 bps = 1%.</div>

        <label className="text-sm">Treasury address</label>
        <Input value={treasury} onChange={(e) => setTreasury(e.target.value)} placeholder="Platform wallet address" />

        <Button onClick={save}>Save</Button>
        {msg && <div className="text-sm text-white/80">{msg}</div>}
      </div>
    </div>
  );
}

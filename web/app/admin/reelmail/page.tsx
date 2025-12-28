"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminReelMail() {
  const [cfg, setCfg] = useState({ defaultReelMailSendCostRgc: 5, defaultReelMailRewardPerViewRgc: 1, defaultReelMailRewardPoolRgc: 100 });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/reelmail-config");
    const j = await r.json();
    if (r.ok) setCfg(j.cfg);
    else setMsg(j.error || "Forbidden");
  }

  async function save() {
    setMsg(null);
    const r = await fetch("/api/admin/reelmail-config", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cfg) });
    const j = await r.json();
    setMsg(r.ok ? "Saved" : (j.error || "Failed"));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Reel Mail Economics</h2>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-3 max-w-xl">
        <label className="text-sm">Default send cost (RGC)</label>
        <Input type="number" value={String(cfg.defaultReelMailSendCostRgc)} onChange={(e) => setCfg({ ...cfg, defaultReelMailSendCostRgc: Number(e.target.value || 0) })} />

        <label className="text-sm">Default reward per view (RGC)</label>
        <Input type="number" value={String(cfg.defaultReelMailRewardPerViewRgc)} onChange={(e) => setCfg({ ...cfg, defaultReelMailRewardPerViewRgc: Number(e.target.value || 0) })} />

        <label className="text-sm">Default reward pool (RGC)</label>
        <Input type="number" value={String(cfg.defaultReelMailRewardPoolRgc)} onChange={(e) => setCfg({ ...cfg, defaultReelMailRewardPoolRgc: Number(e.target.value || 0) })} />

        <Button onClick={save}>Save</Button>
        {msg && <div className="text-sm text-white/80">{msg}</div>}
      </div>
    </div>
  );
}

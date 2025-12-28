"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ReelMailFeed() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/reelmail?box=feed");
    const j = await r.json();
    setItems(j.items || []);
  }

  async function view(id: string) {
    setMsg(null);
    const r = await fetch(`/api/reelmail/${id}/view`, { method: "POST" });
    const j = await r.json();
    if (r.ok) setMsg(j.rewarded ? `You earned ${j.rewarded} RGC` : "Viewed");
    else setMsg(j.error || "Failed");
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Reel Mail Feed</h2>
        <div className="flex gap-2">
          <Link href="/reelmail/compose" className="rounded-2xl bg-flagRed px-4 py-2 font-semibold">Post Reel Mail</Link>
          <Link href="/reelmail/inbox" className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold">Inbox</Link>
        </div>
      </div>

      {msg && <div className="text-sm text-white/80">{msg}</div>}

      <div className="grid gap-4">
        {items.map((m) => (
          <article key={m._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">{new Date(m.createdAt).toLocaleString()}</div>
            <div className="mt-2 font-bold">{m.subject || "Reel Mail"}</div>
            {m.body && <div className="mt-2 text-white/80 whitespace-pre-wrap line-clamp-6">{m.body}</div>}
            <div className="mt-3 text-xs text-white/50">
              Reward: {m.rewardPerViewRgc} RGC/view • Pool remaining: {m.rewardPoolRemainingRgc} RGC
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => view(m._id)}>Watch / View</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

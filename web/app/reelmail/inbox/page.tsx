"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReelMailInbox() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reelmail?box=inbox").then(r => r.json()).then(j => setItems(j.items || []));
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Reel Mail Inbox</h2>
        <Link href="/reelmail" className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold">Back to feed</Link>
      </div>

      <div className="grid gap-3">
        {items.map((m) => (
          <article key={m._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">{new Date(m.createdAt).toLocaleString()}</div>
            <div className="mt-2 font-bold">{m.subject || "Reel Mail"}</div>
            {m.body && <div className="mt-2 text-white/80 whitespace-pre-wrap">{m.body}</div>}
          </article>
        ))}
        {!items.length && <div className="text-white/70">No messages yet.</div>}
      </div>
    </div>
  );
}

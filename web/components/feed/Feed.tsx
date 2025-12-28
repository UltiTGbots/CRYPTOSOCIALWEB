"use client";
import { useEffect, useState } from "react";

export function Feed({ kind }: { kind: "post" | "reel" }) {
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const u = new URL("/api/posts", window.location.origin);
    u.searchParams.set("kind", kind);
    u.searchParams.set("limit", "20");
    if (cursor) u.searchParams.set("cursor", cursor);
    const r = await fetch(u.toString());
    const j = await r.json();
    setItems((prev) => [...prev, ...(j.items || [])]);
    setCursor(j.nextCursor);
    setLoading(false);
  }

  useEffect(() => {
    setItems([]);
    setCursor(null);
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return (
    <div className="grid gap-4">
      {items.map((p) => (
        <article key={p._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">{new Date(p.createdAt).toLocaleString()}</div>
          {p.text && <div className="mt-2 whitespace-pre-wrap">{p.text}</div>}
          {p.mediaUrl && p.mediaType === "image" && <img alt="" src={p.mediaUrl} className="mt-3 w-full rounded-2xl border border-white/10" />}
          {p.mediaUrl && p.mediaType === "video" && <video className="mt-3 w-full rounded-2xl border border-white/10" controls src={p.mediaUrl} />}
        </article>
      ))}

      <div className="flex justify-center">
        <button onClick={loadMore} disabled={loading || !cursor} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-50">
          {cursor ? (loading ? "Loading..." : "Load more") : "No more"}
        </button>
      </div>
    </div>
  );
}

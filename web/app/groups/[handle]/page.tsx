"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GroupPage() {
  const params = useParams<{ handle: string }>();
  const handle = String(params.handle);
  const [group, setGroup] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const r = await fetch(`/api/groups/${handle}`);
    const j = await r.json();
    if (!r.ok) return setErr(j.error || "Failed");
    setGroup(j.group);
    setMembership(j.membership);
  }

  async function join() {
    const r = await fetch(`/api/groups/${handle}/join`, { method: "POST" });
    const j = await r.json();
    if (r.ok) load();
    else setErr(j.error || "Failed");
  }

  async function leave() {
    const r = await fetch(`/api/groups/${handle}/leave`, { method: "POST" });
    const j = await r.json();
    if (r.ok) load();
    else setErr(j.error || "Failed");
  }

  useEffect(() => { load(); }, [handle]);

  if (err) return <div className="text-white/70">{err}</div>;
  if (!group) return <div className="text-white/70">Loading…</div>;

  const status = membership?.status || "";
  const role = membership?.role || "";

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold">{group.name} <span className="text-white/60 text-base">@{group.handle}</span></div>
          <div className="mt-2 text-white/70 whitespace-pre-wrap">{group.description}</div>
          <div className="mt-2 text-xs text-white/50">{group.isPrivate ? "Private" : "Public"} • {group.membersCount} members</div>
        </div>
        <div className="flex gap-2">
          {status === "active" ? (
            <>
              <Link href={`/compose?group=${group.handle}`} className="rounded-2xl bg-flagRed px-4 py-2 font-semibold">Post</Link>
              <Button variant="ghost" onClick={leave}>Leave</Button>
            </>
          ) : status === "requested" ? (
            <div className="text-sm text-white/70">Request pending</div>
          ) : (
            <Button onClick={join}>{group.isPrivate ? "Request to join" : "Join"}</Button>
          )}
          {(role === "owner" || role === "admin") && <Link href={`/groups/${group.handle}/manage`} className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold">Manage</Link>}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-xl font-extrabold">Group feed</h3>
        <GroupFeed groupHandle={group.handle} />
      </div>
    </div>
  );
}

function GroupFeed({ groupHandle }: { groupHandle: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadMore(reset = false) {
    setLoading(true);
    const u = new URL("/api/posts", window.location.origin);
    u.searchParams.set("kind", "post");
    u.searchParams.set("group", groupHandle);
    u.searchParams.set("limit", "20");
    if (!reset && cursor) u.searchParams.set("cursor", cursor);
    const r = await fetch(u.toString());
    const j = await r.json();
    setItems((prev) => reset ? (j.items || []) : [...prev, ...(j.items || [])]);
    setCursor(j.nextCursor);
    setLoading(false);
  }

  useEffect(() => { setItems([]); setCursor(null); loadMore(true); }, [groupHandle]);

  return (
    <div className="grid gap-4">
      {items.map((p) => (
        <article key={p._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">{new Date(p.createdAt).toLocaleString()}</div>
          {p.isPaywalled && p.priceUsdCents > 0 && (
            <div className="mt-2 text-xs text-flagRed font-semibold">Paywalled • ${(p.priceUsdCents/100).toFixed(2)}</div>
          )}
          {p.text && <div className="mt-2 whitespace-pre-wrap">{p.text}</div>}
          {p.tokenLaunch?.platform && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm">
              <div className="font-bold">Token launch attached</div>
              <div className="text-white/70">Platform: {p.tokenLaunch.platform} • Mint: {p.tokenLaunch.mint || "pending"} • Status: {p.tokenLaunch.status}</div>
              {p.tokenLaunch.txSignature && <div className="text-white/60">Tx: {p.tokenLaunch.txSignature}</div>}
            </div>
          )}
          {p.isPaywalled && p.priceUsdCents > 0 && (
            <a className="mt-3 inline-block rounded-2xl bg-flagBlue px-4 py-2 font-semibold" href={`/p/${p._id}`}>Unlock (x402)</a>
          )}
        </article>
      ))}

      <div className="flex justify-center">
        <button onClick={() => loadMore(false)} disabled={loading || !cursor} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-50">
          {cursor ? (loading ? "Loading..." : "Load more") : "No more"}
        </button>
      </div>
    </div>
  );
}

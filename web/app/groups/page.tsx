"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function GroupsPage() {
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<any[]>([]);

  async function load() {
    const u = new URL("/api/groups", window.location.origin);
    if (q) u.searchParams.set("q", q);
    const r = await fetch(u.toString());
    const j = await r.json();
    setGroups(j.groups || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold">Groups</h2>
        <Link className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold" href="/groups/create">Create</Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search groups..." />
        <Button type="button" onClick={load}>Search</Button>
      </div>

      <div className="grid gap-3">
        {groups.map((g) => (
          <Link key={g._id} href={`/groups/${g.handle}`} className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
            <div className="font-bold">{g.name} <span className="text-white/60 text-sm">@{g.handle}</span></div>
            <div className="text-sm text-white/70 mt-1 line-clamp-2">{g.description}</div>
            <div className="text-xs text-white/50 mt-2">{g.isPrivate ? "Private" : "Public"} • {g.membersCount} members</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ManageGroup() {
  const params = useParams<{ handle: string }>();
  const handle = String(params.handle);
  const [items, setItems] = useState<any[]>([]);
  const [role, setRole] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const r = await fetch(`/api/groups/${handle}/members`);
    const j = await r.json();
    if (!r.ok) return setErr(j.error || "Failed");
    setItems(j.items || []);
    setRole(j.viewerRole || "");
  }

  async function act(targetUserId: string, action: string) {
    const r = await fetch(`/api/groups/${handle}/members/moderate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ targetUserId, action }) });
    if (r.ok) load();
  }

  useEffect(() => { load(); }, [handle]);

  if (err) return <div className="text-white/70">{err}</div>;

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Manage @{handle}</h2>
      <div className="grid gap-3">
        {items.map((m) => (
          <div key={m._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
            <div>
              <div className="font-bold">@{m.user?.username || "unknown"} <span className="text-white/60 text-sm">({m.role})</span></div>
              <div className="text-xs text-white/50">status: {m.status}</div>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {m.status === "requested" && <Button onClick={() => act(String(m.userId), "approve")}>Approve</Button>}
              {m.status === "requested" && <Button variant="ghost" onClick={() => act(String(m.userId), "reject")}>Reject</Button>}
              {m.status === "active" && <Button variant="ghost" onClick={() => act(String(m.userId), "remove")}>Remove</Button>}
              {role === "owner" && m.role !== "admin" && m.role !== "owner" && <Button onClick={() => act(String(m.userId), "promote")}>Promote</Button>}
              {role === "owner" && m.role === "admin" && <Button variant="ghost" onClick={() => act(String(m.userId), "demote")}>Demote</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

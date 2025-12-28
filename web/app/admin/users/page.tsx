"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const r = await fetch("/api/admin/users");
    const j = await r.json();
    if (!r.ok) setErr(j.error || "Forbidden");
    else setUsers(j.users || []);
  }

  async function setBan(userId: string, banned: boolean) {
    const r = await fetch("/api/admin/users/ban", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId, banned }) });
    if (r.ok) load();
  }

  useEffect(() => { load(); }, []);

  if (err) return <div className="text-white/70">{err}</div>;

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Users</h2>
      <div className="grid gap-3">
        {users.map((u) => (
          <div key={u._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
            <div>
              <div className="font-bold">@{u.username}</div>
              <div className="text-sm text-white/70">{u.email || "(no email returned)"} {u.isAdmin ? "• admin" : ""}</div>
              <div className="text-xs text-white/50">banned: {String(u.flags?.isBanned ?? false)}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setBan(u._id, false)}>Unban</Button>
              <Button onClick={() => setBan(u._id, true)}>Ban</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

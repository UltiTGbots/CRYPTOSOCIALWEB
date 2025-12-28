"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function CreateGroup() {
  const r = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const res = await fetch("/api/groups", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, handle, description, isPrivate }) });
    const j = await res.json();
    if (!res.ok) return setMsg(j.error || "Failed");
    r.push(`/groups/${j.handle}`);
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-3">
      <h2 className="text-2xl font-extrabold">Create group</h2>
      <label className="text-sm">Name</label>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <label className="text-sm">Handle</label>
      <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. patriots" />
      <label className="text-sm">Description</label>
      <textarea className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-flagBlue min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
        Private group (requires approval)
      </label>
      <Button type="button" onClick={submit} disabled={!name || !handle}>Create</Button>
      {msg && <div className="text-sm text-white/80">{msg}</div>}
    </div>
  );
}

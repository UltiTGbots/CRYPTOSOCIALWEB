"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function MessagesPage() {
  const { data } = useSession();
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [room, setRoom] = useState("");
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const u = new URL("/api/messages", window.location.origin);
    u.searchParams.set("roomId", room);
    const r = await fetch(u.toString());
    const j = await r.json();
    setItems(j.items || []);
  }

  async function send() {
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toUsername: to, text }),
    });
    const j = await r.json();
    if (r.ok) {
      setText("");
      setRoom(j.roomId);
      await load();
    }
  }

  useEffect(() => { if (room) load(); }, [room]);

  if (!data?.user) return <div className="text-white/70">Please sign in to message.</div>;

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Messages</h2>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 grid gap-3">
        <div className="text-sm text-white/70">Send a message by username</div>
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="username (without @)" />
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message..." />
        <Button onClick={send} disabled={!to || !text}>Send</Button>
        {room && <div className="text-xs text-white/60">Room: {room}</div>}
      </div>

      <div className="grid gap-3">
        {items.map((m) => (
          <div key={m._id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">{new Date(m.createdAt).toLocaleString()}</div>
            <div className="mt-1">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

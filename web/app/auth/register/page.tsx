"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const r = await fetch("/api/account/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, username, name }) });
    const j = await r.json();
    setMsg(r.ok ? "Account created. You can sign in now." : (j.error || "Failed"));
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
      <h2 className="text-xl font-extrabold">Create account</h2>
      <p className="text-sm text-white/70 mt-1">Email/password accounts support password reset.</p>
      <div className="mt-4 grid gap-3">
        <label className="text-sm">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <label className="text-sm">Username (optional)</label>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_handle" />
        <label className="text-sm">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label className="text-sm">Password</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <Button type="button" onClick={submit}>Create</Button>
        {msg && <div className="text-sm text-white/80">{msg}</div>}
        <div className="text-sm text-white/70">Already have an account? <Link className="hover:underline" href="/auth/sign-in">Sign in</Link></div>
      </div>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"username" | "password">("password");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const r = await fetch("/api/account/forgot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, type }) });
    setMsg(r.ok ? "If an account exists, we sent instructions to your email." : "Please try again.");
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
      <h2 className="text-xl font-extrabold">Account recovery</h2>
      <p className="text-sm text-white/70 mt-1">If you lost email access, recover by signing in with X/Facebook/Google if linked. Otherwise contact owner/admin.</p>
      <div className="mt-4 grid gap-3">
        <label className="text-sm">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <div className="flex gap-2">
          <Button variant={type === "password" ? "primary" : "ghost"} onClick={() => setType("password")}>Reset password</Button>
          <Button variant={type === "username" ? "primary" : "ghost"} onClick={() => setType("username")}>Remind username</Button>
        </div>
        <Button type="button" onClick={submit}>Send</Button>
        {msg && <div className="text-sm text-white/80">{msg}</div>}
        <Link href="/auth/sign-in" className="text-sm text-white/70 hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}

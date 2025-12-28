"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    const r = await fetch("/api/account/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, newPassword: pw }) });
    const j = await r.json();
    setMsg(r.ok ? "Password updated. You can sign in now." : (j.error || "Failed"));
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
      <h2 className="text-xl font-extrabold">Reset password</h2>
      <p className="text-sm text-white/70 mt-1">Enter a new password for your account.</p>
      <div className="mt-4 grid gap-3">
        <label className="text-sm">New password</label>
        <Input value={pw} onChange={(e) => setPw(e.target.value)} type="password" required />
        <Button type="button" onClick={submit}>Update password</Button>
        {msg && <div className="text-sm text-white/80">{msg}</div>}
        <Link href="/auth/sign-in" className="text-sm text-white/70 hover:underline">Sign in</Link>
      </div>
    </div>
  );
}

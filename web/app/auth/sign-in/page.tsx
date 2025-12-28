"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
      <h2 className="text-xl font-extrabold">Sign in</h2>
      <p className="text-sm text-white/70 mt-1">Use X, Facebook, Google, or email.</p>
      <div className="mt-4 grid gap-2">
        <Button onClick={() => signIn("twitter", { callbackUrl: "/feed" })}>Continue with X</Button>
        <Button onClick={() => signIn("facebook", { callbackUrl: "/feed" })}>Continue with Facebook</Button>
        <Button onClick={() => signIn("google", { callbackUrl: "/feed" })}>Continue with Google</Button>
      </div>
      <div className="my-5 border-t border-white/10" />
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); signIn("credentials", { email, password, callbackUrl: "/feed" }); }}>
        <label className="text-sm">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label className="text-sm">Password</label>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <Button type="submit">Sign in with Email</Button>
        <div className="flex justify-between text-sm text-white/70">
          <Link href="/auth/register" className="hover:underline">Create account</Link>
          <Link href="/auth/forgot" className="hover:underline">Forgot?</Link>
        </div>
      </form>
    </div>
  );
}

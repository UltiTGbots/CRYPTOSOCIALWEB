"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/Button";

export function Nav() {
  const { data } = useSession();
  const isAdmin = (data as any)?.isAdmin;

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-flagBlack/70 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight text-lg">
          <span className="text-flagWhite">Reel</span><span className="text-flagBlue">Tok</span><span className="text-flagRed">z</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/feed" className="text-sm hover:opacity-90">Feed</Link>
          <Link href="/reels" className="text-sm hover:opacity-90">Reels</Link>
          <Link href="/messages" className="text-sm hover:opacity-90">Messages</Link>
          {isAdmin && <Link href="/admin" className="text-sm hover:opacity-90">Admin</Link>}
          {data?.user ? <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button> : <Link href="/auth/sign-in" className="text-sm hover:opacity-90">Sign in</Link>}
          <a className="text-sm hover:opacity-90" href="/groups">Groups</a>
  <a className="text-sm hover:opacity-90" href="/compose">Create</a>
  <a className="text-sm hover:opacity-90" href="/wallet">Wallet</a>
  <a className="text-sm hover:opacity-90" href="/billing">Billing</a>
  <a className="text-sm hover:opacity-90" href="/credits">Credits</a>
  <a className="text-sm hover:opacity-90" href="/reelmail">Reelmail</a>
</nav>
      </div>
    </header>
  );
}

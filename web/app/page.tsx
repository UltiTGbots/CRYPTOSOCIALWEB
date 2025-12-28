import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-flagWhite">Reel</span><span className="text-flagBlue">Tok</span><span className="text-flagRed">z</span>{" "}
          <span className="text-white/70">Web</span>
        </h1>
        <p className="mt-2 text-white/70">Fast, responsive, secure web experience with sign-in via X, Facebook, Google, or email.</p>
        <div className="mt-5 flex gap-3">
          <Link href="/feed" className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold">Open Feed</Link>
          <Link href="/auth/sign-in" className="rounded-2xl bg-flagRed px-4 py-2 font-semibold">Sign in</Link>
        </div>
      </section>
    </div>
  );
}

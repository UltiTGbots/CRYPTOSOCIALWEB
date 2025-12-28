import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function AdminHome() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return <div className="text-white/70">Forbidden</div>;
  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-extrabold">Admin</h2>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-white/70">Manage users and moderation.</div>
        <div className="mt-3 flex gap-3">
          <Link className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold" href="/admin/users">Users</Link>
        </div>
            <a className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition" href="/admin/platform">
        <div className="text-xl font-extrabold">Monetization</div>
        <div className="text-sm text-white/70 mt-1">Configure x402 fee + treasury</div>
      </a>
          <a className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition" href="/admin/reelmail">
        <div className="text-xl font-extrabold">Reel Mail</div>
        <div className="text-sm text-white/70 mt-1">Default costs + rewards</div>
      </a>
    </div>
    </div>
  );
}

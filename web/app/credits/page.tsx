"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CreditsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/rgc/balance").then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">RGC Credits</h2>
          <div className="text-sm text-white/70 mt-1">Balance + recent activity.</div>
        </div>
        <Link href="/billing" className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold">Buy / Upgrade</Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-white/60">Current package</div>
        <div className="text-xl font-extrabold">{data?.tier || "—"}</div>
        <div className="mt-3 text-sm text-white/60">Balance</div>
        <div className="text-3xl font-extrabold">{data?.balance ?? "—"} <span className="text-white/60 text-base">RGC</span></div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-extrabold">Recent ledger</div>
        <div className="mt-3 grid gap-2">
          {(data?.ledger || []).map((x: any) => (
            <div key={x._id} className="flex justify-between text-sm text-white/70 border-b border-white/10 py-2">
              <div>{x.reason}</div>
              <div className={x.delta >= 0 ? "text-green-300" : "text-flagRed"}>{x.delta >= 0 ? "+" : ""}{x.delta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

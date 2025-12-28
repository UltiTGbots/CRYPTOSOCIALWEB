"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ComposeReelMail() {
  const [visibility, setVisibility] = useState<"feed"|"inbox">("feed");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendCostRgc, setSendCostRgc] = useState(5);
  const [rewardPerViewRgc, setRewardPerViewRgc] = useState(1);
  const [rewardPoolRgc, setRewardPoolRgc] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reelmail-config").then(r => r.json()).then(j => {
      if (j?.cfg) {
        setSendCostRgc(j.cfg.defaultReelMailSendCostRgc ?? 5);
        setRewardPerViewRgc(j.cfg.defaultReelMailRewardPerViewRgc ?? 1);
        setRewardPoolRgc(j.cfg.defaultReelMailRewardPoolRgc ?? 100);
      }
    }).catch(() => {});
  }, []);

  async function submit() {
    setMsg(null);
    const r = await fetch("/api/reelmail", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        visibility,
        recipientUsername: visibility === "inbox" ? recipientUsername : "",
        subject,
        body,
        sendCostRgc,
        rewardPerViewRgc: visibility === "feed" ? rewardPerViewRgc : 0,
        rewardPoolRgc: visibility === "feed" ? rewardPoolRgc : 0,
      }),
    });
    const j = await r.json();
    if (r.ok) {
      setMsg("Sent!");
      window.location.href = visibility === "inbox" ? "/reelmail/inbox" : "/reelmail";
    } else {
      setMsg(j.error || "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-extrabold">Compose Reel Mail</h2>
        <Link href="/credits" className="rounded-2xl bg-flagBlue px-4 py-2 font-semibold">RGC Balance</Link>
      </div>

      <div className="flex gap-2">
        <Button variant={visibility === "feed" ? "primary" : "ghost"} onClick={() => setVisibility("feed")}>Post to Feed</Button>
        <Button variant={visibility === "inbox" ? "primary" : "ghost"} onClick={() => setVisibility("inbox")}>Send to Inbox</Button>
      </div>

      {visibility === "inbox" && (
        <div className="grid gap-2">
          <label className="text-sm">Recipient username</label>
          <Input value={recipientUsername} onChange={(e) => setRecipientUsername(e.target.value)} placeholder="@username" />
        </div>
      )}

      <div className="grid gap-2">
        <label className="text-sm">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Message</label>
        <textarea className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-flagBlue min-h-[180px]" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/30 p-4 grid gap-3">
        <div className="text-sm font-bold">Costs</div>
        <label className="text-sm">Send cost (RGC)</label>
        <Input type="number" value={String(sendCostRgc)} onChange={(e) => setSendCostRgc(Number(e.target.value || 0))} />
        {visibility === "feed" && (
          <>
            <label className="text-sm">Reward per view (RGC)</label>
            <Input type="number" value={String(rewardPerViewRgc)} onChange={(e) => setRewardPerViewRgc(Number(e.target.value || 0))} />
            <label className="text-sm">Reward pool funded by you (RGC)</label>
            <Input type="number" value={String(rewardPoolRgc)} onChange={(e) => setRewardPoolRgc(Number(e.target.value || 0))} />
            <div className="text-xs text-white/60">Viewers earn from your pool until it runs out.</div>
          </>
        )}
      </div>

      <Button onClick={submit} disabled={!body && !subject}>Send</Button>
      {msg && <div className="text-sm text-white/80">{msg}</div>}
      <div className="text-xs text-white/50">
        If you see “Insufficient RGC”, go to Billing to buy credits or upgrade.
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SiweMessage } from "siwe";
import bs58 from "bs58";

async function getNonce() {
  const r = await fetch("/api/wallet/nonce");
  return r.json();
}

export default function WalletConnectPage() {
  const [msg, setMsg] = useState<string | null>(null);

  async function connectEvm(provider: "metamask" | "coinbase") {
    setMsg(null);
    try {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("No EVM wallet found");
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const address = accounts?.[0];
      const { nonce } = await getNonce();

      const siwe = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to ReelTokz",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
      });
      const message = siwe.prepareMessage();
      const signature = await eth.request({ method: "personal_sign", params: [message, address] });

      const r = await fetch("/api/wallet/verify-evm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, signature, provider }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Verify failed");
      setMsg(`Wallet linked: ${j.address}`);
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    }
  }

  async function connectSolana(provider: "phantom" | "solflare") {
    setMsg(null);
    try {
      const wallet = provider === "phantom" ? (window as any).solana : (window as any).solflare;
      if (!wallet) throw new Error("Wallet not found");
      await wallet.connect();
      const address = wallet.publicKey?.toString?.() || wallet.publicKey?.toBase58?.();
      const { nonce } = await getNonce();
      const message = `reeltokz.com wants you to sign in with your Solana account:\n${address}\n\nNonce: ${nonce}`;
      const signed = await wallet.signMessage(new TextEncoder().encode(message), "utf8");
      const sigBase58 = bs58.encode(signed.signature);

      const r = await fetch("/api/wallet/verify-solana", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, message, signatureBase58: sigBase58, provider, nonce }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Verify failed");
      setMsg(`Wallet linked: ${j.address}`);
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft grid gap-4">
      <h2 className="text-2xl font-extrabold">Wallet login / link</h2>
      <p className="text-sm text-white/70">
        Register/log in with a wallet, or link a wallet to an existing profile.
      </p>

      <div className="grid gap-2">
        <div className="text-sm font-bold">EVM</div>
        <Button onClick={() => connectEvm("metamask")}>Connect MetaMask</Button>
        <Button onClick={() => connectEvm("coinbase")}>Connect Coinbase Wallet</Button>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-bold">Solana</div>
        <Button onClick={() => connectSolana("phantom")}>Connect Phantom</Button>
        <Button onClick={() => connectSolana("solflare")}>Connect Solflare</Button>
      </div>

      {msg && <div className="text-sm text-white/80">{msg}</div>}
    </div>
  );
}

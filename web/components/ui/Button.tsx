import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition shadow-soft";
  const styles = variant === "primary" ? "bg-flagRed text-flagWhite hover:opacity-90" : "bg-transparent text-flagWhite hover:bg-white/10 shadow-none";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

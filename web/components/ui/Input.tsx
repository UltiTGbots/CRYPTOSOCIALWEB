import React from "react";
type Props = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className = "", ...props }: Props) {
  return <input className={`w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm outline-none focus:border-flagBlue ${className}`} {...props} />;
}

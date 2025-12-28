import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        flagBlue: "#0A3161",
        flagRed: "#B31942",
        flagWhite: "#FFFFFF",
        flagBlack: "#0B0D12",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;

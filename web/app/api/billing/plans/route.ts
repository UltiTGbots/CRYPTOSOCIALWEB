import { NextResponse } from "next/server";
import { PACKAGES } from "@/lib/packages";

export async function GET() {
  return NextResponse.json({
    packages: [
      { id: "FREE", ...PACKAGES.FREE },
      { id: "GOLD", ...PACKAGES.GOLD },
      { id: "BUSINESS", ...PACKAGES.BUSINESS },
      { id: "COINS", ...PACKAGES.COINS },
    ],
  });
}

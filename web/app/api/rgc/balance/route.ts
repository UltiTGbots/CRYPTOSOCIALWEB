import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { CreditLedger } from "@/models/CreditLedger";
import { ensureFreeMonthlyGrant } from "@/lib/grants";

export async function GET() {
  const session = await auth();
  if (!session || !(session as any).userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureFreeMonthlyGrant(String((session as any).userId));
  await dbConnect();
  const u = await User.findById((session as any).userId).select({ rgcBalance: 1, accountTier: 1 }).lean();
  const ledger = await CreditLedger.find({ userId: (session as any).userId }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({ balance: u?.rgcBalance || 0, tier: u?.accountTier || "free", ledger });
}

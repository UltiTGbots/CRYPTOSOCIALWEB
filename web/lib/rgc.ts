import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { CreditLedger } from "@/models/CreditLedger";

export async function addRgc(userId: string, delta: number, reason: string, refId = "", meta: any = {}) {
  await dbConnect();
  const u = await User.findById(userId).exec();
  if (!u) throw new Error("User not found");
  u.rgcBalance = (u.rgcBalance || 0) + delta;
  if (u.rgcBalance < 0) throw new Error("Insufficient RGC");
  await u.save();
  await CreditLedger.create({ userId, delta, reason, refId, meta });
  return u.rgcBalance;
}

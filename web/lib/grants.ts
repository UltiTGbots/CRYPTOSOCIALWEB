import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";
import { PACKAGES } from "@/lib/packages";
import { addRgc } from "@/lib/rgc";

/**
 * Mirrors original mobile/backend behavior:
 * - FREE: +20 signup bonus once, +10 monthly
 * - GOLD: +20 bonus on subscription start, +20 monthly on renewals
 * - BUSINESS: +50 bonus on subscription start, +50 monthly on renewals
 * - COINS: one-time +20
 *
 * For FREE monthly credits, we grant lazily when the user hits the API (no cron required).
 */
export async function ensureFreeMonthlyGrant(userId: string) {
  await dbConnect();
  const u = await User.findById(userId).exec();
  if (!u) return;

  // signup bonus for all new users: FREE package definition
  if (!u.signupBonusGranted) {
    const bonus = PACKAGES.FREE.signupBonusRgc || 0;
    if (bonus > 0) await addRgc(userId, bonus, "signup_bonus", "", { tier: "FREE" });
    u.signupBonusGranted = true;
    u.lastMonthlyGrantAt = new Date();
    await u.save();
    return;
  }

  if (u.accountTier !== "FREE") return;

  const monthly = PACKAGES.FREE.monthlyRgc || 0;
  if (monthly <= 0) return;

  const last = u.lastMonthlyGrantAt ? new Date(u.lastMonthlyGrantAt) : null;
  const now = new Date();
  if (!last) {
    u.lastMonthlyGrantAt = now;
    await u.save();
    return;
  }

  const days = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  if (days >= 30) {
    await addRgc(userId, monthly, "monthly_grant", "", { tier: "FREE" });
    u.lastMonthlyGrantAt = now;
    await u.save();
  }
}

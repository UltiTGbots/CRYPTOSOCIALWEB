import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { addRgc } from "@/lib/rgc";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = z.object({
    userId: z.string().min(10),
    delta: z.number().int().min(-1000000).max(1000000),
    reason: z.string().min(2).max(60).optional().default("admin_adjust"),
  }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const bal = await addRgc(parsed.data.userId, parsed.data.delta, parsed.data.reason, "", {});
  return NextResponse.json({ ok: true, balance: bal });
}

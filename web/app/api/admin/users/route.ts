import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session || !(session as any).isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ users });
}

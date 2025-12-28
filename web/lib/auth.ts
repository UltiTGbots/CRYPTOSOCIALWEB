import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "./mongodb";
import { env } from "./env";
import { z } from "zod";
import { dbConnect } from "./mongoose";
import { User } from "@/models/User";
import argon2 from "argon2";
import { nanoid } from "nanoid";

function normalizeUsername(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);
}

async function ensureUniqueUsername(base: string) {
  await dbConnect();
  let candidate = base || `user_${nanoid(6)}`;
  for (let i = 0; i < 10; i++) {
    const exists = await User.findOne({ username: candidate }).lean();
    if (!exists) return candidate;
    candidate = `${base}_${nanoid(4)}`.slice(0, 24);
  }
  return `user_${nanoid(10)}`.slice(0, 24);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient()),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" },
  providers: [
    Twitter({ clientId: env.X_CLIENT_ID ?? "", clientSecret: env.X_CLIENT_SECRET ?? "" }),
    Facebook({ clientId: env.FACEBOOK_CLIENT_ID ?? "", clientSecret: env.FACEBOOK_CLIENT_SECRET ?? "" }),
    Google({ clientId: env.GOOGLE_CLIENT_ID ?? "", clientSecret: env.GOOGLE_CLIENT_SECRET ?? "" }),
    Credentials({
      name: "Email",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
        if (!parsed.success) return null;
        await dbConnect();
        const user = await User.findOne({ email: parsed.data.email }).lean();
        if (!user?.passwordHash) return null;
        const ok = await argon2.verify(user.passwordHash, parsed.data.password);
        if (!ok) return null;
        return { id: String(user._id), name: user.name ?? user.username, email: user.email, image: user.image ?? null };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
      const u = await User.findOne({ email: user.email }).lean();
      if (u?.flags?.isBanned) return false;

      if (env.OWNER_EMAIL && user.email && user.email === env.OWNER_EMAIL) {
        await User.updateOne({ email: user.email }, { $set: { isAdmin: true } }).exec();
      }

      if (account?.provider) {
        const provider = account.provider;
        const handle =
          provider === "twitter"
            ? (profile as any)?.data?.username || (profile as any)?.screen_name || (profile as any)?.username
            : provider === "facebook"
            ? (profile as any)?.name
            : provider === "google"
            ? (profile as any)?.email?.split("@")[0]
            : undefined;

        const base = normalizeUsername(handle || user.email?.split("@")[0] || user.name || "");
        const username = await ensureUniqueUsername(base);

        await User.updateOne(
          { email: user.email },
          { $setOnInsert: { username }, $addToSet: { providers: provider }, $set: { name: user.name, image: user.image } },
          { upsert: true }
        ).exec();
      }
      return true;
    },
    async jwt({ token }) {
      await dbConnect();
      if (token?.email) {
        const u = await User.findOne({ email: token.email }).lean();
        if (u) {
          (token as any).username = u.username;
          (token as any).isAdmin = !!u.isAdmin;
          (token as any).userId = String(u._id);
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).username = (token as any).username;
      (session as any).isAdmin = (token as any).isAdmin;
      (session as any).userId = (token as any).userId;
      return session;
    },
  },
  trustHost: true,
  secret: env.NEXTAUTH_SECRET,
});

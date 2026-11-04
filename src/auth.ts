import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Advocate Credentials",
      credentials: {
        email: { label: "ইমেইল", type: "email" },
        password: { label: "পাসওয়ার্ড", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const user = await db.getUserByEmail(email);
        if (user) {
          if (!user.password || user.password === password) {
            return {
              id: user.id,
              name: user.fullName,
              email: user.email,
              isAdmin: Boolean(user.isAdmin),
            } as any;
          }
        }

        // Demo advocate credentials fallback
        if (
          email === "advocate@demo.bd" ||
          password === "legal123" ||
          password === "demo123"
        ) {
          const fallback = await db.getUser("demo-user");
          return {
            id: fallback?.id || "demo-user-advocate-001",
            name: fallback?.fullName || "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
            email: email || "advocate@demo.bd",
            isAdmin: true,
          } as any;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user && token.id) {
        session.user.id = String(token.id);
        (session.user as any).isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "legalai-bd-super-secret-key-2026-bangladesh",
  session: { strategy: "jwt" },
});

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    }),
    ...(process.env.NODE_ENV !== "production" ? [
      CredentialsProvider({
      name: "Mock Credentials (Testing)",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        name: { label: "Name", type: "text", placeholder: "Test User" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || "Test User",
              dailyBudgetKg: 5.0,
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          city: user.city,
          dailyBudgetKg: user.dailyBudgetKg,
        };
      },
    })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.city !== undefined) token.city = session.city;
        if (session.dailyBudgetKg !== undefined) token.dailyBudgetKg = session.dailyBudgetKg;
      }
      
      if (user) {
        token.id = user.id;
        token.city = user.city;
        token.dailyBudgetKg = user.dailyBudgetKg;
      } else {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.city = dbUser.city;
          token.dailyBudgetKg = dbUser.dailyBudgetKg;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.city = token.city as string | null | undefined;
        session.user.dailyBudgetKg = (token.dailyBudgetKg as number) ?? 5.0;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "some-really-long-fallback-secret-key-12345",
};

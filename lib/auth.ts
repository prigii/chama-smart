import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            chama: true, // Include chama information
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isCorrectPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          chamaId: user.chamaId,
          chamaName: user.chama?.name ?? undefined,
          chamaLogo: (user.chama as any)?.logo ?? undefined,
          avatarUrl: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user && (user as any).id) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.chamaId = (user as any).chamaId;
        token.chamaName = (user as any).chamaName;
        token.chamaLogo = (user as any).chamaLogo;
        token.avatarUrl = (user as any).avatarUrl;
      }

      // Handle session update
      if (trigger === "update" && session?.user) {
        token.chamaName = session.user.chamaName || token.chamaName;
        token.chamaLogo = session.user.chamaLogo || token.chamaLogo;
        token.avatarUrl = session.user.avatarUrl || token.avatarUrl;
        token.name = session.user.name || token.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.chamaId = token.chamaId as string | null;
        session.user.chamaName = token.chamaName as string | undefined;
        session.user.chamaLogo = token.chamaLogo as string | undefined;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

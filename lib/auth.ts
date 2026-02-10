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

        const authenticatedUser = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
          include: {
            chama: true,
          },
        });

        if (!authenticatedUser || !authenticatedUser.password) {
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          authenticatedUser.password
        );

        if (!isCorrectPassword) {
          return null;
        }

        return {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
          role: authenticatedUser.role,
          chamaId: authenticatedUser.chamaId,
          chamaName: authenticatedUser.chama?.name ?? undefined,
          chamaLogo: (authenticatedUser.chama as any)?.logo ?? undefined,
          avatarUrl: authenticatedUser.avatarUrl ?? undefined,
          image: authenticatedUser.avatarUrl ?? undefined, // Sync with standard image field
          phone: authenticatedUser.phone ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.chamaId = (user as any).chamaId;
        token.chamaName = (user as any).chamaName;
        token.chamaLogo = (user as any).chamaLogo;
        token.avatarUrl = (user as any).avatarUrl || (user as any).image;
        token.phone = (user as any).phone;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === "update" && session?.user) {
        token.id = session.user.id || token.id;
        token.role = session.user.role || token.role;
        token.chamaId = session.user.chamaId || token.chamaId;
        token.chamaName = session.user.chamaName || token.chamaName;
        token.chamaLogo = session.user.chamaLogo || token.chamaLogo;
        token.avatarUrl = session.user.avatarUrl || session.user.image || token.avatarUrl;
        token.name = session.user.name || token.name;
        token.email = session.user.email || token.email;
        token.phone = session.user.phone || token.phone;
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
        (session.user as any).avatarUrl = token.avatarUrl as string | undefined;
        session.user.image = token.avatarUrl as string | undefined; // Map back to standard image
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as any).phone = token.phone as string | undefined;
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

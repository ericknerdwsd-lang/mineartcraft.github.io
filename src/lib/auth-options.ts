import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",");
      if (user.email && allowedEmails.includes(user.email)) {
        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: "/gestor/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

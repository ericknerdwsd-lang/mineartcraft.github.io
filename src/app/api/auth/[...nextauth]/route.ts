import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
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
      return false; // Bloqueia outros emails
    },
  },
  pages: {
    signIn: "/gestor/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",");
        return !!token?.email && allowedEmails.includes(token.email);
      },
    },
    pages: {
      signIn: "/gestor/login",
    },
  }
);

export const config = {
  matcher: ["/gestor/:path*"],
};

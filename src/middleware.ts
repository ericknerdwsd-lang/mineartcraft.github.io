import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { isValidOrigin } from "@/lib/csrf";

const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

// Rotas API que exigem autenticação (mutating)
const PROTECTED_API_PATTERNS = [
  "/api/products",
  "/api/carousel",
  "/api/upload",
];

function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_PATTERNS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// Middleware para rotas /gestor/* (autenticação via next-auth)
const authMiddleware = withAuth(
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteção CSRF para todas as rotas API com métodos mutating
  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(request.method)) {
    if (!isValidOrigin(request)) {
      return NextResponse.json(
        { error: "Requisição bloqueada (CSRF)" },
        { status: 403 }
      );
    }
  }

  // Proteção de autenticação no middleware para rotas API sensíveis
  if (isProtectedApiRoute(pathname) && MUTATING_METHODS.has(request.method)) {
    // Delegar ao authMiddleware do next-auth
    return (authMiddleware as Function)(request);
  }

  // Proteção de autenticação para páginas /gestor/*
  if (pathname.startsWith("/gestor") && pathname !== "/gestor/login") {
    return (authMiddleware as Function)(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gestor/:path*", "/api/:path*"],
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

/**
 * Validates the current session. Returns 401 if unauthenticated.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Autenticação necessária" },
        { status: 401 }
      ),
    };
  }

  // Re-verificar email no allowlist (defesa em profundidade)
  const allowedEmails = (process.env.ALLOWED_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  if (!allowedEmails.includes(session.user.email)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}

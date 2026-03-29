import { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Verifica o header Origin/Referer para proteção contra CSRF.
 * Retorna true se a requisição é segura, false se suspeita.
 */
export function isValidOrigin(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Em requisições POST/PUT/DELETE, o browser deve enviar Origin
  const source = origin || referer;
  if (!source) return false;

  try {
    const url = new URL(source);
    const host = request.headers.get("host") || request.nextUrl.host;
    return url.host === host;
  } catch {
    return false;
  }
}

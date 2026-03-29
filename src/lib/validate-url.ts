/**
 * Valida se uma URL de imagem é de uma origem permitida.
 * Aceita: uploads locais (/uploads/) ou Vercel Blob (HTTPS).
 */
export function isAllowedImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  if (url.startsWith("/uploads/")) return true;

  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".public.blob.vercel-storage.com")
    ) {
      return true;
    }
  } catch {
    // URL inválida
  }

  return false;
}

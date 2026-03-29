import { del } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

/**
 * Apaga uma imagem do storage (Vercel Blob ou disco local).
 * Falhas são silenciadas com log — nunca interrompem a operação principal.
 */
export async function deleteImageFromStorage(url: string): Promise<void> {
  if (!url) return;

  const blobToken =
    process.env.Aamigurumi_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.amigurumi_READ_WRITE_TOKEN ||
    process.env.amegurumi_READ_WRITE_TOKEN;

  if (url.includes("public.blob.vercel-storage.com")) {
    if (!blobToken) {
      console.warn("BLOB_READ_WRITE_TOKEN não configurado — imagem não removida do Blob.");
      return;
    }
    try {
      await del(url, { token: blobToken });
    } catch (e) {
      console.error(`Erro ao remover do Vercel Blob: ${url}`, e instanceof Error ? e.message : "unknown");
    }
  } else if (url.startsWith("/uploads/")) {
    // Extrair apenas o nome do arquivo (última parte após /)
    const rawFilename = url.split("/").pop();
    if (!rawFilename) return;

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsDir, rawFilename);

    // Path confinement: garantir que o caminho final está dentro de uploads/
    if (!filePath.startsWith(uploadsDir + path.sep) && filePath !== uploadsDir) {
      console.error(`[deleteImage] Tentativa de path traversal bloqueada: ${filePath}`);
      return;
    }

    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.error(`Erro ao remover arquivo local: ${rawFilename}`, e instanceof Error ? e.message : "unknown");
    }
  }
}

/**
 * Apaga um array de imagens do storage, em paralelo.
 */
export async function deleteImagesFromStorage(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;
  await Promise.allSettled(urls.map(deleteImageFromStorage));
}

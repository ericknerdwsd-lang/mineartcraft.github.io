export const dynamic = "force-dynamic";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/auth-guard";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

function sanitizeFilename(originalName: string): string {
  const base = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 64)
    .toLowerCase();
  return base || "upload";
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Apenas JPEG, PNG, WebP e GIF." },
        { status: 400 }
      );
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo excede o tamanho máximo de 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar magic bytes (conteúdo real do arquivo)
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Conteúdo do arquivo não corresponde ao tipo declarado." },
        { status: 400 }
      );
    }

    // Gerar nome seguro com extensão derivada do MIME validado
    const timestamp = Date.now();
    const baseName = sanitizeFilename(file.name);
    const ext = MIME_TO_EXT[file.type];
    const safeFilename = `${timestamp}-${baseName}${ext}`;

    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    const blobToken = process.env.Aamigurumi_READ_WRITE_TOKEN ||
                      process.env.BLOB_READ_WRITE_TOKEN ||
                      process.env.amigurumi_READ_WRITE_TOKEN ||
                      process.env.amegurumi_READ_WRITE_TOKEN;

    // Tentar upload via Vercel Blob se o token existir
    if (blobToken) {
      try {
        const blob = await put(safeFilename, buffer, {
          token: blobToken,
          access: "public",
          contentType: file.type,
          addRandomSuffix: true,
        });
        return NextResponse.json({ url: blob.url });
      } catch (uploadError) {
        console.error("Erro no Vercel Blob:", uploadError instanceof Error ? uploadError.message : "unknown");

        if (isVercel) {
          return NextResponse.json(
            { error: "Erro ao salvar no Vercel Blob. Verifique a configuração de armazenamento." },
            { status: 500 }
          );
        }
      }
    } else if (isVercel) {
      return NextResponse.json(
        { error: "Configuração ausente: BLOB_READ_WRITE_TOKEN não encontrado no ambiente Vercel." },
        { status: 500 }
      );
    }

    // Fallback para armazenamento local (apenas fora da Vercel)
    try {
      const uploadDir = path.resolve(process.cwd(), "public", "uploads");
      const filePath = path.resolve(uploadDir, safeFilename);

      // Path confinement check
      if (!filePath.startsWith(uploadDir)) {
        return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
      }

      await fs.writeFile(filePath, new Uint8Array(buffer));
      return NextResponse.json({ url: `/uploads/${safeFilename}` });
    } catch (localError) {
      console.error("Erro no fallback local:", localError instanceof Error ? localError.message : "unknown");
      return NextResponse.json(
        { error: "Erro ao salvar arquivo localmente." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral no upload:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro inesperado ao processar o upload." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Tentar upload via Vercel Blob se o token existir
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, {
          access: "public",
        });
        return NextResponse.json({ url: blob.url });
      } catch (uploadError) {
        console.error("Erro no Vercel Blob, usando fallback local:", uploadError);
      }
    }

    // Fallback para armazenamento local (public/uploads)
    // Útil para desenvolvimento local sem token ou quando o serviço está indisponível
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para evitar sobrescrita
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, "-").toLowerCase();
    const filename = `${timestamp}-${safeName}`;
    
    // Caminho da pasta public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);

    // Escrever o arquivo
    await fs.writeFile(filePath, new Uint8Array(buffer));
    
    // Retornar a URL relativa
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Erro geral no upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}

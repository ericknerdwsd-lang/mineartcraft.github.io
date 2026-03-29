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

    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    // Buscar o token do Vercel Blob (pode ter prefixo se houver múltiplos stores)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || 
                      process.env.amigurumi_READ_WRITE_TOKEN || 
                      process.env.amegurumi_READ_WRITE_TOKEN;

    // Tentar upload via Vercel Blob se o token existir
    if (blobToken) {
      try {
        const blob = await put(file.name, file, {
          token: blobToken,
          access: "public",
        });
        return NextResponse.json({ url: blob.url });
      } catch (uploadError) {
        console.error("Erro no Vercel Blob:", uploadError);
        
        // Se estiver na Vercel, não tentamos fallback local pois irá falhar
        if (isVercel) {
          return NextResponse.json(
            { error: "Erro ao salvar no Vercel Blob. Verifique a configuração de armazenamento." },
            { status: 500 }
          );
        }
      }
    } else if (isVercel) {
      // Se estiver na Vercel e sem token, retornamos erro informativo
      return NextResponse.json(
        { error: "Configuração ausente: BLOB_READ_WRITE_TOKEN não encontrado no ambiente Vercel." },
        { status: 500 }
      );
    }

    // Fallback para armazenamento local (apenas fora da Vercel)
    try {
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
    } catch (localError) {
      console.error("Erro no fallback local:", localError);
      return NextResponse.json(
        { error: "Erro ao salvar arquivo localmente. Verifique as permissões de escrita." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral no upload:", error);
    return NextResponse.json(
      { error: "Erro inesperado ao processar o upload." },
      { status: 500 }
    );
  }
}

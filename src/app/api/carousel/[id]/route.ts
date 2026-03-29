import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { del } from "@vercel/blob";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar a imagem para pegar a url
    const imageToDelete = await prisma.carouselImage.findUnique({
      where: { id },
    });

    if (!imageToDelete) {
      return NextResponse.json(
        { error: "Imagem não encontrada." },
        { status: 404 }
      );
    }

    // Deletar a URL usando as mesmas regras do delete do product
    const url = imageToDelete.url;
    if (url.startsWith("http") && url.includes("public.blob.vercel-storage.com")) {
      // É uma imagem do Vercel Blob
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN || 
                        process.env.amigurumi_READ_WRITE_TOKEN || 
                        process.env.amegurumi_READ_WRITE_TOKEN;
                        
      if (blobToken) {
        try {
          await del(url, { token: blobToken });
        } catch (e) {
          console.error(`Erro ao apagar blob ${url}:`, e);
        }
      }
    } else if (url.startsWith("/uploads/")) {
      // Arquivo local
      const fileName = url.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Erro ao deletar arquivo local ${filePath}:`, err);
      }
    }

    // Excluir do DB
    await prisma.carouselImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir imagem do carrossel:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir imagem." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const images = await prisma.carouselImage.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens do carrossel:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro interno no servidor ao listar imagens do carrossel." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    // Validar se já tem 4 imagens
    const count = await prisma.carouselImage.count();
    if (count >= 4) {
      return NextResponse.json(
        { error: "O limite de 4 imagens para o carrossel já foi atingido." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { error: "A URL da imagem é obrigatória." },
        { status: 400 }
      );
    }

    // Validar URL: apenas HTTPS de hosts confiáveis ou caminhos locais de upload
    const isLocalUpload = url.startsWith("/uploads/");
    let isAllowedRemote = false;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
        isAllowedRemote = true;
      }
    } catch {
      // URL inválida — só aceita se for upload local
    }

    if (!isLocalUpload && !isAllowedRemote) {
      return NextResponse.json(
        { error: "URL não permitida. Use o upload de imagens ou URLs do Vercel Blob." },
        { status: 400 }
      );
    }

    const newImage = await prisma.carouselImage.create({
      data: {
        url,
        order: count, // Automaticamente o próximo da lista (0, 1, 2, 3)
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar imagem ao carrossel:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro interno no servidor ao salvar imagem." },
      { status: 500 }
    );
  }
}

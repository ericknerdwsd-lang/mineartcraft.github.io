import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const images = await prisma.carouselImage.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens do carrossel:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao listar imagens do carrossel." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Validar se já tem 4 imagens
    const count = await prisma.carouselImage.count();
    if (count >= 4) {
      return NextResponse.json(
        { error: "O limite de 4 imagens para o carrossel já foi atingido." },
        { status: 400 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "A URL da imagem é obrigatória." },
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
    console.error("Erro ao adicionar imagem ao carrossel:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao salvar imagem." },
      { status: 500 }
    );
  }
}

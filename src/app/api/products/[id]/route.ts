export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { deleteImagesFromStorage } from "@/lib/deleteImage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, images, category } = body;

    // Buscar imagens atuais para detectar quais foram removidas
    const existing = await prisma.product.findUnique({ where: { id } });
    if (existing) {
      const newImages: string[] = images || [];
      const removedImages = (existing.images as string[]).filter(
        (url) => !newImages.includes(url)
      );
      // Apagar do storage as imagens removidas pelo admin
      await deleteImagesFromStorage(removedImages);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        images: images || [],
        category,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar o produto para pegar as imagens antes de deletar
    const product = await prisma.product.findUnique({ where: { id } });
    if (product) {
      // Apagar todas as imagens do storage
      await deleteImagesFromStorage(product.images as string[]);
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    return NextResponse.json(
      { error: "Erro ao remover produto" },
      { status: 500 }
    );
  }
}

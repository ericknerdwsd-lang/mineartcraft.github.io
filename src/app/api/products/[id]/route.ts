export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { deleteImagesFromStorage } from "@/lib/deleteImage";
import { requireAuth } from "@/lib/auth-guard";
import { isAllowedImageUrl } from "@/lib/validate-url";

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
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, images, category } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: "Preço inválido" },
        { status: 400 }
      );
    }

    const ALLOWED_CATEGORIES = ["amigurumis", "roupas", "bolsas_acessorios"];
    const safeCategory = ALLOWED_CATEGORIES.includes(category) ? category : "amigurumis";

    const safeImages = Array.isArray(images)
      ? images.slice(0, 4).filter((url: unknown) => typeof url === "string" && isAllowedImageUrl(url))
      : [];

    // Buscar imagens atuais para detectar quais foram removidas
    const existing = await prisma.product.findUnique({ where: { id } });
    if (existing) {
      const removedImages = (existing.images as string[]).filter(
        (url) => !safeImages.includes(url)
      );
      // Apagar do storage as imagens removidas pelo admin
      await deleteImagesFromStorage(removedImages);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: String(name).slice(0, 200),
        description: String(description || "").slice(0, 2000),
        price: parsedPrice,
        images: safeImages,
        category: safeCategory,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error instanceof Error ? error.message : "unknown");
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
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

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
    console.error("Erro ao remover produto:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro ao remover produto" },
      { status: 500 }
    );
  }
}

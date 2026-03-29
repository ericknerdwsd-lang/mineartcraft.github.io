export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { isAllowedImageUrl } from "@/lib/validate-url";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
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

    const product = await prisma.product.create({
      data: {
        name: String(name).slice(0, 200),
        description: String(description || "").slice(0, 2000),
        price: parsedPrice,
        images: Array.isArray(images)
          ? images.slice(0, 4).filter((url: unknown) => typeof url === "string" && isAllowedImageUrl(url))
          : [],
        category: safeCategory,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

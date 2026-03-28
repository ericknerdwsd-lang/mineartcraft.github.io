export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, category } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        category: category || "amigurumis",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

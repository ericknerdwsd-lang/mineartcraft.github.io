export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Erro ao buscar tags:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro ao buscar tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { slug, label, bgColor, textColor } = body;

    if (!slug || !label) {
      return NextResponse.json(
        { error: "Slug e label são obrigatórios" },
        { status: 400 }
      );
    }

    // Sanitize slug: lowercase, no spaces, alphanumeric + underscore only
    const safeSlug = String(slug)
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 50);

    if (!safeSlug) {
      return NextResponse.json(
        { error: "Slug inválido" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.tag.findUnique({ where: { slug: safeSlug } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma tag com esse identificador" },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        slug: safeSlug,
        label: String(label).slice(0, 100),
        bgColor: String(bgColor || "#E8D5F5").slice(0, 9),
        textColor: String(textColor || "#7B2D9E").slice(0, 9),
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tag:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro ao criar tag" },
      { status: 500 }
    );
  }
}

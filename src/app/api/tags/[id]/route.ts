export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const { label, bgColor, textColor } = body;

    if (!label) {
      return NextResponse.json(
        { error: "Label é obrigatório" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        label: String(label).slice(0, 100),
        bgColor: String(bgColor || "#E8D5F5").slice(0, 9),
        textColor: String(textColor || "#7B2D9E").slice(0, 9),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Erro ao atualizar tag:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro ao atualizar tag" },
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
    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ message: "Tag removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover tag:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro ao remover tag" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImageFromStorage } from "@/lib/deleteImage";
import { requireAuth } from "@/lib/auth-guard";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const imageToDelete = await prisma.carouselImage.findUnique({
      where: { id },
    });

    if (!imageToDelete) {
      return NextResponse.json(
        { error: "Imagem não encontrada." },
        { status: 404 }
      );
    }

    // Apagar do storage (Vercel Blob ou local)
    await deleteImageFromStorage(imageToDelete.url);

    // Excluir do banco
    await prisma.carouselImage.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir imagem do carrossel:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Erro interno ao excluir imagem." },
      { status: 500 }
    );
  }
}

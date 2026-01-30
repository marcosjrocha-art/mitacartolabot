import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jogador = await prisma.jogador.findUnique({
      where: { id: params.id },
      include: {
        clube: true,
      },
    });

    if (!jogador) {
      return NextResponse.json(
        { error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ jogador });
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jogos = await prisma.jogo.findMany({
      where: { rodadaId: params.id },
      include: {
        mandante: true,
        visitante: true,
      },
    });

    return NextResponse.json({ jogos });
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

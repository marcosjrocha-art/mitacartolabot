import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const historico = await prisma.pontuacao.findMany({
      where: { jogadorId: params.id },
      include: {
        rodada: true,
      },
      orderBy: {
        rodada: {
          numero: 'asc',
        },
      },
    });

    return NextResponse.json({ historico });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

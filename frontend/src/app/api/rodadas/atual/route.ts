import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar rodada com status ABERTA ou a mais recente
    let rodada = await prisma.rodada.findFirst({
      where: {
        status: 'ABERTA',
      },
    });

    if (!rodada) {
      rodada = await prisma.rodada.findFirst({
        orderBy: {
          numero: 'desc',
        },
      });
    }

    return NextResponse.json({ rodada });
  } catch (error) {
    console.error('Erro ao buscar rodada atual:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

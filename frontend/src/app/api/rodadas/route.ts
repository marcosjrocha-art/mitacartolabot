import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rodadas = await prisma.rodada.findMany({
      orderBy: {
        numero: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({ rodadas });
  } catch (error) {
    console.error('Erro ao buscar rodadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const posicao = searchParams.get('posicao');
    const clubeId = searchParams.get('clubeId');
    const search = searchParams.get('search');

    const where: any = {};

    if (posicao) {
      where.posicao = posicao;
    }

    if (clubeId) {
      where.clubeId = clubeId;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { apelido: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jogadores, total] = await Promise.all([
      prisma.jogador.findMany({
        where,
        include: {
          clube: true,
        },
        orderBy: [
          { mediaPontos: 'desc' },
          { preco: 'desc' },
        ],
        take: 100,
      }),
      prisma.jogador.count({ where }),
    ]);

    return NextResponse.json({ jogadores, total });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

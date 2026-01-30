import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalJogadores,
      totalRodadas,
      rodadaAtual,
      timesGerados,
    ] = await Promise.all([
      prisma.jogador.count(),
      prisma.rodada.count(),
      prisma.rodada.findFirst({
        where: { status: 'ABERTA' },
        orderBy: { numero: 'desc' },
      }),
      prisma.timeSalvo.count(),
    ]);

    // Calcular média de acurácia das rodadas processadas
    const rodadasProcessadas = await prisma.rodada.findMany({
      where: { 
        status: 'PROCESSADA',
        maeModelo: { not: null },
      },
      select: {
        maeModelo: true,
      },
    });

    const mediaAcuracia = rodadasProcessadas.length > 0
      ? rodadasProcessadas.reduce((acc, r) => acc + (r.maeModelo || 0), 0) / rodadasProcessadas.length
      : 0;

    return NextResponse.json({
      totalJogadores,
      totalRodadas,
      rodadaAtual,
      timesGerados,
      mediaAcuracia: Math.max(0, 100 - mediaAcuracia * 10), // Converter MAE para acurácia aproximada
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

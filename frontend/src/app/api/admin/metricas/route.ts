import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Buscar métricas das rodadas processadas
    const rodadas = await prisma.rodada.findMany({
      where: {
        status: 'PROCESSADA',
        maeModelo: { not: null },
      },
      select: {
        maeModelo: true,
        rmseModelo: true,
        ndcgModelo: true,
      },
    });

    const totalRodadas = rodadas.length;
    
    const metricas = totalRodadas > 0 ? {
      mae: rodadas.reduce((acc, r) => acc + (r.maeModelo || 0), 0) / totalRodadas,
      rmse: rodadas.reduce((acc, r) => acc + (r.rmseModelo || 0), 0) / totalRodadas,
      ndcg: rodadas.reduce((acc, r) => acc + (r.ndcgModelo || 0), 0) / totalRodadas,
      totalRodadas,
    } : {
      mae: null,
      rmse: null,
      ndcg: null,
      totalRodadas: 0,
    };

    return NextResponse.json({ metricas });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    
    if (error instanceof Error && error.message === 'Acesso negado') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

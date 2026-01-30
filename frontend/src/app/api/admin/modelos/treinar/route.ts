import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const trainQueue = new Queue('train-model', { connection: redis });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    // Adicionar job à fila
    const job = await trainQueue.add('train-model', {
      timestamp: new Date().toISOString(),
    }, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Treinamento iniciado',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Erro ao iniciar treinamento:', error);
    
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

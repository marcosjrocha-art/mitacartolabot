import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const importQueue = new Queue('import-csv', { connection: redis });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      );
    }

    // Ler conteúdo do arquivo
    const buffer = await file.arrayBuffer();
    const content = Buffer.from(buffer).toString('utf-8');

    // Adicionar job à fila
    const job = await importQueue.add('import-csv', {
      filename: file.name,
      content,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Importação iniciada',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Erro ao importar CSV:', error);
    
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

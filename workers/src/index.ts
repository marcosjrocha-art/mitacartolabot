/**
 * MitaBot Workers - Processamento assíncrono de jobs
 */

import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import axios from 'axios';
import { processCSVImport } from './jobs/import-csv';
import { processModelTraining } from './jobs/train-model';
import { processPredictions } from './jobs/generate-predictions';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Configuração das filas
const queues = {
  'import-csv': new Queue('import-csv', { connection: redis }),
  'train-model': new Queue('train-model', { connection: redis }),
  'generate-predictions': new Queue('generate-predictions', { connection: redis }),
};

// Workers
const workers = [
  // Worker de importação CSV
  new Worker(
    'import-csv',
    async (job) => {
      console.log(`[Import CSV] Processando job ${job.id}...`);
      try {
        await processCSVImport(job.data);
        console.log(`[Import CSV] Job ${job.id} concluído com sucesso`);
      } catch (error) {
        console.error(`[Import CSV] Erro no job ${job.id}:`, error);
        throw error;
      }
    },
    { connection: redis, concurrency: 2 }
  ),

  // Worker de treinamento
  new Worker(
    'train-model',
    async (job) => {
      console.log(`[Train Model] Processando job ${job.id}...`);
      try {
        await processModelTraining(job.data);
        console.log(`[Train Model] Job ${job.id} concluído com sucesso`);
      } catch (error) {
        console.error(`[Train Model] Erro no job ${job.id}:`, error);
        throw error;
      }
    },
    { connection: redis, concurrency: 1 }
  ),

  // Worker de geração de previsões
  new Worker(
    'generate-predictions',
    async (job) => {
      console.log(`[Generate Predictions] Processando job ${job.id}...`);
      try {
        await processPredictions(job.data);
        console.log(`[Generate Predictions] Job ${job.id} concluído com sucesso`);
      } catch (error) {
        console.error(`[Generate Predictions] Erro no job ${job.id}:`, error);
        throw error;
      }
    },
    { connection: redis, concurrency: 1 }
  ),
];

// Event listeners
workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completado`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} falhou:`, err.message);
  });
});

console.log('🚀 Workers iniciados!');
console.log('   - import-csv: Processamento de arquivos CSV');
console.log('   - train-model: Treinamento do modelo ML');
console.log('   - generate-predictions: Geração de previsões');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, encerrando workers...');
  await Promise.all(workers.map((w) => w.close()));
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido, encerrando workers...');
  await Promise.all(workers.map((w) => w.close()));
  await redis.quit();
  process.exit(0);
});

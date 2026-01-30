/**
 * Job de treinamento do modelo ML
 */

import axios from 'axios';

interface TrainingData {
  timestamp: string;
  rodadas?: number[];
}

export async function processModelTraining(data: TrainingData): Promise<void> {
  console.log('[Train Model] Iniciando treinamento...');
  
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  
  try {
    // Chamar API de treinamento do ML Service
    const response = await axios.post(`${mlServiceUrl}/train`, {
      rodadas: data.rodadas,
      retrain: true,
    });
    
    console.log('[Train Model] Treinamento concluído:', response.data);
    
    // Após treinamento, gerar previsões para a rodada atual
    await gerarPrevisoesRodadaAtual(mlServiceUrl);
    
  } catch (error) {
    console.error('[Train Model] Erro no treinamento:', error);
    throw error;
  }
}

async function gerarPrevisoesRodadaAtual(mlServiceUrl: string): Promise<void> {
  console.log('[Train Model] Gerando previsões para rodada atual...');
  
  try {
    // Buscar rodada atual
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const rodadaResponse = await axios.get(`${frontendUrl}/api/rodadas/atual`);
    const rodada = rodadaResponse.data.rodada;
    
    if (!rodada) {
      console.warn('[Train Model] Nenhuma rodada atual encontrada');
      return;
    }
    
    // Gerar previsões em batch
    await axios.post(`${mlServiceUrl}/batch-predict`, null, {
      params: { rodada_id: rodada.id },
    });
    
    console.log('[Train Model] Previsões geradas com sucesso!');
    
  } catch (error) {
    console.error('[Train Model] Erro ao gerar previsões:', error);
    // Não lançar erro para não falhar o job completo
  }
}

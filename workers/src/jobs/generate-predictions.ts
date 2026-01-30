/**
 * Job de geração de previsões
 */

import axios from 'axios';

interface PredictionsData {
  rodada_id: string;
  forcar_regeneracao?: boolean;
}

export async function processPredictions(data: PredictionsData): Promise<void> {
  const { rodada_id, forcar_regeneracao = false } = data;
  
  console.log(`[Generate Predictions] Rodada: ${rodada_id}`);
  
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
  
  try {
    // Verificar se já existem previsões
    if (!forcar_regeneracao) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const previsoesResponse = await axios.get(
        `${frontendUrl}/api/previsoes/rodada/${rodada_id}`
      );
      
      if (previsoesResponse.data.previsoes?.length > 0) {
        console.log('[Generate Predictions] Previsões já existem, pulando...');
        return;
      }
    }
    
    // Gerar previsões
    const response = await axios.post(`${mlServiceUrl}/batch-predict`, null, {
      params: { rodada_id },
    });
    
    console.log('[Generate Predictions] Previsões geradas:', response.data);
    
  } catch (error) {
    console.error('[Generate Predictions] Erro:', error);
    throw error;
  }
}

"""
MitaBot ML Service - Microserviço de Machine Learning para o Cartola FC
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .models.predictor import CartolaPredictor
from .models.optimizer import TeamOptimizer
from .database import Database

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Instâncias globais
predictor: Optional[CartolaPredictor] = None
optimizer: Optional[TeamOptimizer] = None
db: Optional[Database] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    global predictor, optimizer, db
    
    logger.info("Iniciando ML Service...")
    
    # Inicializar conexão com banco de dados
    db = Database(os.getenv('DATABASE_URL'))
    
    # Inicializar predictor
    predictor = CartolaPredictor()
    
    # Tentar carregar modelo existente
    model_path = os.getenv('MODEL_PATH', '/app/models')
    if os.path.exists(f'{model_path}/cartola_model.pkl'):
        logger.info("Carregando modelo existente...")
        predictor.load_model(f'{model_path}/cartola_model.pkl')
    else:
        logger.info("Nenhum modelo encontrado. Treinamento necessário.")
    
    # Inicializar optimizer
    optimizer = TeamOptimizer()
    
    logger.info("ML Service iniciado com sucesso!")
    
    yield
    
    # Cleanup
    logger.info("Encerrando ML Service...")
    if db:
        db.close()


app = FastAPI(
    title="MitaBot ML Service",
    description="API de Machine Learning para recomendação de times do Cartola FC",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schemas Pydantic
class PredictionRequest(BaseModel):
    jogadores: List[str]
    rodada_id: str


class PredictionResponse(BaseModel):
    jogador_id: str
    pontos_esperados: float
    desvio_padrao: float
    intervalo_inferior: float
    intervalo_superior: float


class OptimizationRequest(BaseModel):
    orcamento: float
    esquema: str
    previsoes: List[Dict[str, Any]]
    estrategia: str = "EQUILIBRADO"


class OptimizationResponse(BaseModel):
    time: Dict[str, Any]
    alternativas: List[Dict[str, Any]]


class TrainingRequest(BaseModel):
    rodadas: Optional[List[int]] = None
    retrain: bool = False


class TrainingResponse(BaseModel):
    success: bool
    message: str
    metrics: Optional[Dict[str, float]] = None


class MetricsResponse(BaseModel):
    mae: Optional[float]
    rmse: Optional[float]
    ndcg: Optional[float]
    mae_por_posicao: Dict[str, float]
    acuracia_top10: float
    acuracia_top50: float
    versao: str
    ultimo_treinamento: Optional[str]
    total_amostras: int


# Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": predictor is not None and predictor.is_fitted,
        "database_connected": db is not None and db.is_connected()
    }


@app.post("/predict", response_model=List[PredictionResponse])
async def predict(request: PredictionRequest):
    """
    Prediz a pontuação esperada para uma lista de jogadores
    """
    if not predictor or not predictor.is_fitted:
        raise HTTPException(
            status_code=503,
            detail="Modelo não está treinado. Execute o treinamento primeiro."
        )
    
    try:
        # Buscar features dos jogadores
        features = db.get_jogadores_features(request.jogadores, request.rodada_id)
        
        if not features:
            raise HTTPException(
                status_code=404,
                detail="Nenhum jogador encontrado com os IDs fornecidos"
            )
        
        # Fazer predições
        predictions = predictor.predict(features)
        
        return predictions
        
    except Exception as e:
        logger.error(f"Erro na predição: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: OptimizationRequest):
    """
    Otimiza a escalação do time respeitando restrições
    """
    try:
        result = optimizer.optimize(
            previsoes=request.previsoes,
            orcamento=request.orcamento,
            esquema=request.esquema,
            estrategia=request.estrategia
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Erro na otimização: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train", response_model=TrainingResponse)
async def train(request: TrainingRequest):
    """
    Treina o modelo com dados históricos
    """
    try:
        # Buscar dados de treinamento
        training_data = db.get_training_data(request.rodadas)
        
        if len(training_data) < 100:
            raise HTTPException(
                status_code=400,
                detail=f"Dados insuficientes para treinamento. Encontrados: {len(training_data)}"
            )
        
        # Treinar modelo
        metrics = predictor.train(
            training_data,
            retrain=request.retrain
        )
        
        # Salvar modelo
        model_path = os.getenv('MODEL_PATH', '/app/models')
        predictor.save_model(f'{model_path}/cartola_model.pkl')
        
        return TrainingResponse(
            success=True,
            message="Modelo treinado com sucesso",
            metrics=metrics
        )
        
    except Exception as e:
        logger.error(f"Erro no treinamento: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """
    Retorna métricas do modelo atual
    """
    if not predictor:
        raise HTTPException(status_code=503, detail="Predictor não inicializado")
    
    try:
        metrics = predictor.get_metrics()
        return MetricsResponse(**metrics)
        
    except Exception as e:
        logger.error(f"Erro ao obter métricas: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/batch-predict")
async def batch_predict(rodada_id: str):
    """
    Gera previsões para todos os jogadores de uma rodada
    """
    if not predictor or not predictor.is_fitted:
        raise HTTPException(
            status_code=503,
            detail="Modelo não está treinado"
        )
    
    try:
        # Buscar todos os jogadores da rodada
        jogadores = db.get_jogadores_rodada(rodada_id)
        
        if not jogadores:
            raise HTTPException(
                status_code=404,
                detail="Nenhum jogador encontrado para esta rodada"
            )
        
        # Buscar features
        features = db.get_jogadores_features(
            [j['id'] for j in jogadores],
            rodada_id
        )
        
        # Fazer predições
        predictions = predictor.predict(features)
        
        # Salvar previsões no banco
        db.save_predictions(rodada_id, predictions)
        
        return {
            "success": True,
            "total_predictions": len(predictions),
            "rodada_id": rodada_id
        }
        
    except Exception as e:
        logger.error(f"Erro no batch predict: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

"""
Modelo de predição de pontuação do Cartola FC usando XGBoost
"""

import logging
import pickle
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import xgboost as xgb

logger = logging.getLogger(__name__)


class CartolaPredictor:
    """
    Preditor de pontuação do Cartola FC usando Gradient Boosting
    """
    
    def __init__(self):
        self.model: Optional[xgb.XGBRegressor] = None
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.metrics: Dict[str, Any] = {}
        self.feature_columns = [
            'media_3_rodadas',
            'media_5_rodadas',
            'media_geral',
            'desvio_padrao',
            'preco',
            'variacao_preco',
            'jogos',
            'eh_mandante',
            'forca_adversario',
            'prob_sofrer_gol',
            'prob_fazer_gol',
            'gols_ultimas_3',
            'assistencias_ultimas_3',
            'scout_ofensivo',
            'scout_defensivo',
        ]
        self.categorical_columns = ['posicao', 'status']
        self.posicao_map = {
            'GOLEIRO': 0,
            'ZAGUEIRO': 1,
            'LATERAL': 2,
            'MEIA': 3,
            'ATACANTE': 4,
            'TECNICO': 5,
        }
        self.status_map = {
            'PROVAVEL': 0,
            'DUVIDA': 1,
            'SUSPENSO': 2,
            'LESIONADO': 3,
            'NULO': 4,
        }
    
    def _preprocess_features(self, df: pd.DataFrame, fit: bool = False) -> np.ndarray:
        """
        Preprocessa as features para o modelo
        """
        # Criar cópia para não modificar original
        data = df.copy()
        
        # Mapear categorias
        data['posicao'] = data['posicao'].map(self.posicao_map).fillna(0)
        data['status'] = data['status'].map(self.status_map).fillna(0)
        
        # Garantir que todas as colunas existam
        for col in self.feature_columns:
            if col not in data.columns:
                data[col] = 0
        
        # Selecionar features
        features = data[self.feature_columns + self.categorical_columns].values
        
        # Normalizar
        if fit:
            features = self.scaler.fit_transform(features)
        else:
            features = self.scaler.transform(features)
        
        return features
    
    def train(
        self,
        data: pd.DataFrame,
        retrain: bool = False
    ) -> Dict[str, float]:
        """
        Treina o modelo com dados históricos
        
        Args:
            data: DataFrame com features e target (pontos)
            retrain: Se True, ignora modelo anterior e treina do zero
        
        Returns:
            Dicionário com métricas de treinamento
        """
        logger.info(f"Iniciando treinamento com {len(data)} amostras...")
        
        if len(data) < 100:
            raise ValueError("Dados insuficientes para treinamento (mínimo 100)")
        
        # Ordenar por data para evitar data leakage
        data = data.sort_values('rodada_numero')
        
        # Separar features e target
        X = self._preprocess_features(data, fit=True)
        y = data['pontos'].values
        
        # Validação temporal (Time Series Split)
        tscv = TimeSeriesSplit(n_splits=5)
        
        mae_scores = []
        rmse_scores = []
        
        for train_idx, val_idx in tscv.split(X):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            # Criar modelo
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                objective='reg:squarederror',
            )
            
            # Treinar
            model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                verbose=False
            )
            
            # Avaliar
            y_pred = model.predict(X_val)
            mae_scores.append(mean_absolute_error(y_val, y_pred))
            rmse_scores.append(np.sqrt(mean_squared_error(y_val, y_pred)))
        
        # Treinar modelo final com todos os dados
        self.model = xgb.XGBRegressor(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42,
            objective='reg:squarederror',
        )
        
        self.model.fit(X, y, verbose=False)
        self.is_fitted = True
        
        # Calcular métricas finais
        y_pred_final = self.model.predict(X)
        
        self.metrics = {
            'mae': float(np.mean(mae_scores)),
            'rmse': float(np.mean(rmse_scores)),
            'mae_final': float(mean_absolute_error(y, y_pred_final)),
            'rmse_final': float(np.sqrt(mean_squared_error(y, y_pred_final))),
            'versao': datetime.now().isoformat(),
            'total_amostras': len(data),
        }
        
        # Importância das features
        feature_importance = dict(zip(
            self.feature_columns + self.categorical_columns,
            self.model.feature_importances_.tolist()
        ))
        self.metrics['feature_importance'] = feature_importance
        
        logger.info(f"Treinamento concluído! MAE: {self.metrics['mae']:.4f}")
        
        return self.metrics
    
    def predict(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Faz predições para uma lista de jogadores
        
        Args:
            data: DataFrame com features dos jogadores
        
        Returns:
            Lista de dicionários com predições
        """
        if not self.is_fitted or self.model is None:
            raise RuntimeError("Modelo não está treinado")
        
        # Preprocessar
        X = self._preprocess_features(data, fit=False)
        
        # Predizer
        predictions = self.model.predict(X)
        
        # Calcular intervalo de confiança (aproximação usando std dos vizinhos)
        # Em produção, usar métodos mais sofisticados como Quantile Regression
        leaf_indices = self.model.apply(X)
        std_predictions = np.std(leaf_indices, axis=1) * 0.5  # Simplificação
        
        # Montar resultado
        results = []
        for i, (pred, std) in enumerate(zip(predictions, std_predictions)):
            jogador_id = data.iloc[i]['jogador_id']
            results.append({
                'jogador_id': str(jogador_id),
                'pontos_esperados': float(max(0, pred)),
                'desvio_padrao': float(std),
                'intervalo_inferior': float(max(0, pred - 1.96 * std)),
                'intervalo_superior': float(max(0, pred + 1.96 * std)),
            })
        
        return results
    
    def save_model(self, path: str) -> None:
        """Salva o modelo em disco"""
        if not self.is_fitted:
            raise RuntimeError("Modelo não está treinado")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'metrics': self.metrics,
            'feature_columns': self.feature_columns,
        }
        
        with open(path, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"Modelo salvo em {path}")
    
    def load_model(self, path: str) -> None:
        """Carrega o modelo do disco"""
        with open(path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.metrics = model_data.get('metrics', {})
        self.feature_columns = model_data.get('feature_columns', self.feature_columns)
        self.is_fitted = True
        
        logger.info(f"Modelo carregado de {path}")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Retorna métricas do modelo"""
        return {
            'mae': self.metrics.get('mae'),
            'rmse': self.metrics.get('rmse'),
            'ndcg': self.metrics.get('ndcg'),  # Seria calculado separadamente
            'mae_por_posicao': self.metrics.get('mae_por_posicao', {}),
            'acuracia_top10': self.metrics.get('acuracia_top10', 0),
            'acuracia_top50': self.metrics.get('acuracia_top50', 0),
            'versao': self.metrics.get('versao', 'N/A'),
            'ultimo_treinamento': self.metrics.get('versao'),
            'total_amostras': self.metrics.get('total_amostras', 0),
        }

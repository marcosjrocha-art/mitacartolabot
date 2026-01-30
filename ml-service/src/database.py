"""
Módulo de acesso ao banco de dados
"""

import logging
from typing import List, Dict, Any, Optional
from contextlib import contextmanager

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

logger = logging.getLogger(__name__)


class Database:
    """
    Gerenciador de conexão com PostgreSQL
    """
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string or 'postgresql://postgres:postgres@localhost:5432/mitabot'
        self.engine = create_engine(
            self.connection_string,
            poolclass=NullPool,
            echo=False
        )
        self._connected = False
        
        # Testar conexão
        try:
            with self.engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            self._connected = True
            logger.info("Conexão com banco de dados estabelecida")
        except Exception as e:
            logger.error(f"Erro ao conectar ao banco: {e}")
    
    def is_connected(self) -> bool:
        return self._connected
    
    def close(self):
        if self.engine:
            self.engine.dispose()
            self._connected = False
            logger.info("Conexão com banco de dados fechada")
    
    @contextmanager
    def get_connection(self):
        """Context manager para conexões"""
        conn = self.engine.connect()
        try:
            yield conn
        finally:
            conn.close()
    
    def get_jogadores_features(
        self,
        jogador_ids: List[str],
        rodada_id: str
    ) -> pd.DataFrame:
        """
        Busca features dos jogadores para predição
        """
        query = text("""
            SELECT 
                j.id as jogador_id,
                j.nome,
                j.apelido,
                j.posicao,
                j.preco,
                j.preco_variacao as variacao_preco,
                j.media_pontos as media_geral,
                j.jogos,
                j.status,
                c.id as clube_id,
                c.elo_ofensivo,
                c.elo_defensivo,
                -- Features da rodada
                p.media_3_rodadas,
                p.media_5_rodadas,
                p.desvio_padrao,
                p.eh_mandante,
                p.forca_adversario,
                p.prob_sofrer_gol,
                p.prob_fazer_gol
            FROM jogadores j
            JOIN clubes c ON j.clube_id = c.id
            LEFT JOIN previsoes p ON p.jogador_id = j.id AND p.rodada_id = :rodada_id
            WHERE j.id = ANY(:jogador_ids)
            AND j.status = 'PROVAVEL'
        """)
        
        with self.get_connection() as conn:
            df = pd.read_sql(
                query,
                conn,
                params={
                    'jogador_ids': jogador_ids,
                    'rodada_id': rodada_id
                }
            )
        
        # Preencher valores nulos
        df['media_3_rodadas'] = df['media_3_rodadas'].fillna(df['media_geral'])
        df['media_5_rodadas'] = df['media_5_rodadas'].fillna(df['media_geral'])
        df['desvio_padrao'] = df['desvio_padrao'].fillna(2.0)
        df['eh_mandante'] = df['eh_mandante'].fillna(False).astype(int)
        df['forca_adversario'] = df['forca_adversario'].fillna(1500)
        df['prob_sofrer_gol'] = df['prob_sofrer_gol'].fillna(0.5)
        df['prob_fazer_gol'] = df['prob_fazer_gol'].fillna(0.5)
        
        # Features adicionais (simplificadas)
        df['gols_ultimas_3'] = 0  # Seria calculado de scouts
        df['assistencias_ultimas_3'] = 0
        df['scout_ofensivo'] = 0
        df['scout_defensivo'] = 0
        
        return df
    
    def get_training_data(
        self,
        rodadas: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Busca dados históricos para treinamento
        """
        rodada_filter = ""
        params = {}
        
        if rodadas:
            rodada_filter = "AND r.numero = ANY(:rodadas)"
            params['rodadas'] = rodadas
        
        query = text(f"""
            SELECT 
                j.id as jogador_id,
                j.nome,
                j.apelido,
                j.posicao,
                j.preco,
                j.preco_variacao as variacao_preco,
                j.media_pontos as media_geral,
                j.jogos,
                j.status,
                c.id as clube_id,
                c.elo_ofensivo,
                c.elo_defensivo,
                r.numero as rodada_numero,
                -- Target
                pt.pontos,
                -- Features históricas (calculadas de scouts anteriores)
                COALESCE(
                    (SELECT AVG(pt2.pontos) 
                     FROM pontuacoes pt2 
                     WHERE pt2.jogador_id = j.id 
                     AND pt2.rodada_id IN (
                         SELECT id FROM rodadas 
                         WHERE numero < r.numero 
                         ORDER BY numero DESC 
                         LIMIT 3
                     )), 
                    j.media_pontos
                ) as media_3_rodadas,
                COALESCE(
                    (SELECT AVG(pt2.pontos) 
                     FROM pontuacoes pt2 
                     WHERE pt2.jogador_id = j.id 
                     AND pt2.rodada_id IN (
                         SELECT id FROM rodadas 
                         WHERE numero < r.numero 
                         ORDER BY numero DESC 
                         LIMIT 5
                     )), 
                    j.media_pontos
                ) as media_5_rodadas,
                COALESCE(
                    (SELECT STDDEV(pt2.pontos) 
                     FROM pontuacoes pt2 
                     WHERE pt2.jogador_id = j.id 
                     AND pt2.rodada_id IN (
                         SELECT id FROM rodadas 
                         WHERE numero < r.numero 
                         ORDER BY numero DESC 
                         LIMIT 5
                     )), 
                    2.0
                ) as desvio_padrao
            FROM pontuacoes pt
            JOIN jogadores j ON pt.jogador_id = j.id
            JOIN clubes c ON j.clube_id = c.id
            JOIN rodadas r ON pt.rodada_id = r.id
            WHERE pt.pontos IS NOT NULL
            {rodada_filter}
            ORDER BY r.numero ASC
        """)
        
        with self.get_connection() as conn:
            df = pd.read_sql(query, conn, params=params)
        
        # Preencher valores nulos
        df['media_3_rodadas'] = df['media_3_rodadas'].fillna(df['media_geral'])
        df['media_5_rodadas'] = df['media_5_rodadas'].fillna(df['media_geral'])
        df['desvio_padrao'] = df['desvio_padrao'].fillna(2.0)
        
        # Features adicionais
        df['eh_mandante'] = 1  # Simplificado
        df['forca_adversario'] = 1500  # Simplificado
        df['prob_sofrer_gol'] = 0.5
        df['prob_fazer_gol'] = 0.5
        df['gols_ultimas_3'] = 0
        df['assistencias_ultimas_3'] = 0
        df['scout_ofensivo'] = 0
        df['scout_defensivo'] = 0
        
        logger.info(f"Dados de treinamento carregados: {len(df)} amostras")
        
        return df
    
    def get_jogadores_rodada(self, rodada_id: str) -> List[Dict[str, Any]]:
        """
        Busca todos os jogadores de uma rodada
        """
        query = text("""
            SELECT 
                j.id,
                j.nome,
                j.apelido,
                j.posicao,
                j.preco,
                j.status,
                c.id as clube_id,
                c.nome as clube_nome
            FROM jogadores j
            JOIN clubes c ON j.clube_id = c.id
            WHERE j.status = 'PROVAVEL'
            ORDER BY j.media_pontos DESC
        """)
        
        with self.get_connection() as conn:
            result = conn.execute(query)
            jogadores = [dict(row._mapping) for row in result]
        
        return jogadores
    
    def save_predictions(
        self,
        rodada_id: str,
        predictions: List[Dict[str, Any]]
    ) -> None:
        """
        Salva previsões no banco de dados
        """
        query = text("""
            INSERT INTO previsoes (
                id, jogador_id, rodada_id, pontos_esperados, desvio_padrao,
                intervalo_inferior, intervalo_superior, modelo_versao, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), :jogador_id, :rodada_id, :pontos_esperados,
                :desvio_padrao, :intervalo_inferior, :intervalo_superior,
                :modelo_versao, NOW(), NOW()
            )
            ON CONFLICT (jogador_id, rodada_id) DO UPDATE SET
                pontos_esperados = EXCLUDED.pontos_esperados,
                desvio_padrao = EXCLUDED.desvio_padrao,
                intervalo_inferior = EXCLUDED.intervalo_inferior,
                intervalo_superior = EXCLUDED.intervalo_superior,
                modelo_versao = EXCLUDED.modelo_versao,
                updated_at = NOW()
        """)
        
        with self.get_connection() as conn:
            for pred in predictions:
                conn.execute(query, {
                    'jogador_id': pred['jogador_id'],
                    'rodada_id': rodada_id,
                    'pontos_esperados': pred['pontos_esperados'],
                    'desvio_padrao': pred['desvio_padrao'],
                    'intervalo_inferior': pred['intervalo_inferior'],
                    'intervalo_superior': pred['intervalo_superior'],
                    'modelo_versao': '1.0.0',
                })
            conn.commit()
        
        logger.info(f"Previsões salvas: {len(predictions)}")

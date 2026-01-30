"""
Otimizador de escalação do Cartola FC usando Programação Linear Inteira
"""

import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import numpy as np
from pulp import (
    LpProblem, LpVariable, LpMaximize, LpBinary, LpContinuous,
    lpSum, LpStatusOptimal, value, PULP_CBC_CMD
)

logger = logging.getLogger(__name__)


@dataclass
class JogadorPrevisao:
    id: str
    nome: str
    apelido: str
    posicao: str
    clube_id: str
    preco: float
    pontos_esperados: float
    desvio_padrao: float
    status: str


class TeamOptimizer:
    """
    Otimizador de time do Cartola FC usando PuLP (ILP)
    """
    
    # Formações suportadas
    FORMACOES = {
        '4-3-3': {'GOLEIRO': 1, 'ZAGUEIRO': 2, 'LATERAL': 2, 'MEIA': 3, 'ATACANTE': 3, 'TECNICO': 1},
        '4-4-2': {'GOLEIRO': 1, 'ZAGUEIRO': 2, 'LATERAL': 2, 'MEIA': 4, 'ATACANTE': 2, 'TECNICO': 1},
        '3-4-3': {'GOLEIRO': 1, 'ZAGUEIRO': 3, 'LATERAL': 0, 'MEIA': 4, 'ATACANTE': 3, 'TECNICO': 1},
        '3-5-2': {'GOLEIRO': 1, 'ZAGUEIRO': 3, 'LATERAL': 0, 'MEIA': 5, 'ATACANTE': 2, 'TECNICO': 1},
        '4-5-1': {'GOLEIRO': 1, 'ZAGUEIRO': 2, 'LATERAL': 2, 'MEIA': 5, 'ATACANTE': 1, 'TECNICO': 1},
        '5-3-2': {'GOLEIRO': 1, 'ZAGUEIRO': 3, 'LATERAL': 2, 'MEIA': 3, 'ATACANTE': 2, 'TECNICO': 1},
    }
    
    def __init__(self):
        self.max_jogadores_por_clube = 3
    
    def optimize(
        self,
        previsoes: List[Dict[str, Any]],
        orcamento: float,
        esquema: str,
        estrategia: str = "EQUILIBRADO"
    ) -> Dict[str, Any]:
        """
        Otimiza a escalação do time
        
        Args:
            previsoes: Lista de previsões de jogadores
            orcamento: Orçamento máximo (C$)
            esquema: Esquema tático (ex: '4-3-3')
            estrategia: 'SEGURO', 'EQUILIBRADO' ou 'OUSADO'
        
        Returns:
            Dicionário com time otimizado e alternativas
        """
        # Validar esquema
        if esquema not in self.FORMACOES:
            raise ValueError(f"Esquema inválido. Opções: {list(self.FORMACOES.keys())}")
        
        formacao = self.FORMACOES[esquema]
        
        # Converter previsões para objetos
        jogadores = []
        for p in previsoes:
            jogador = p.get('jogador', {})
            jogadores.append(JogadorPrevisao(
                id=jogador.get('id', ''),
                nome=jogador.get('nome', ''),
                apelido=jogador.get('apelido', ''),
                posicao=jogador.get('posicao', ''),
                clube_id=jogador.get('clubeId', ''),
                preco=jogador.get('preco', 0),
                pontos_esperados=p.get('pontosEsperados', 0),
                desvio_padrao=p.get('desvioPadrao', 0),
                status=jogador.get('status', 'PROVAVEL'),
            ))
        
        # Filtrar apenas jogadores prováveis
        jogadores = [j for j in jogadores if j.status == 'PROVAVEL']
        
        if len(jogadores) < 11:
            raise ValueError(f"Jogadores insuficientes: {len(jogadores)}")
        
        # Criar problema de otimização
        prob = LpProblem("Cartola_Optimization", LpMaximize)
        
        # Variáveis de decisão (binárias: 0 ou 1)
        x = {j.id: LpVariable(f"x_{j.id}", cat=LpBinary) for j in jogadores}
        
        # Variável para capitão
        c = {j.id: LpVariable(f"c_{j.id}", cat=LpBinary) for j in jogadores}
        
        # Função objetivo: maximizar pontos esperados
        # Aplicar peso da estratégia
        if estrategia == 'SEGURO':
            # Penalizar jogadores com alta variância
            objetivo = lpSum([
                x[j.id] * j.pontos_esperados * (1 - j.desvio_padrao / 10)
                for j in jogadores
            ]) + lpSum([
                c[j.id] * j.pontos_esperados * 0.5  # Capitão tem peso extra
                for j in jogadores
            ])
        elif estrategia == 'OUSADO':
            # Priorizar jogadores com alto potencial (mesmo com variância)
            objetivo = lpSum([
                x[j.id] * (j.pontos_esperados + j.desvio_padrao * 0.3)
                for j in jogadores
            ]) + lpSum([
                c[j.id] * j.pontos_esperados * 0.5
                for j in jogadores
            ])
        else:  # EQUILIBRADO
            objetivo = lpSum([
                x[j.id] * j.pontos_esperados
                for j in jogadores
            ]) + lpSum([
                c[j.id] * j.pontos_esperados * 0.5
                for j in jogadores
            ])
        
        prob += objetivo
        
        # Restrições
        
        # 1. Orçamento
        prob += lpSum([x[j.id] * j.preco for j in jogadores]) <= orcamento
        
        # 2. Número de jogadores por posição
        for posicao, quantidade in formacao.items():
            if quantidade > 0:
                prob += lpSum([
                    x[j.id] for j in jogadores if j.posicao == posicao
                ]) == quantidade
        
        # 3. Total de jogadores (11 titulares)
        prob += lpSum([x[j.id] for j in jogadores]) == 11
        
        # 4. Um capitão
        prob += lpSum([c[j.id] for j in jogadores]) == 1
        
        # 5. Capitão deve estar no time
        for j in jogadores:
            prob += c[j.id] <= x[j.id]
        
        # 6. Máximo de jogadores por clube
        clubes = set(j.clube_id for j in jogadores)
        for clube in clubes:
            prob += lpSum([
                x[j.id] for j in jogadores if j.clube_id == clube
            ]) <= self.max_jogadores_por_clube
        
        # Resolver
        prob.solve(PULP_CBC_CMD(msg=0))
        
        # Verificar solução
        if prob.status != LpStatusOptimal:
            logger.warning(f"Solução não ótima encontrada. Status: {prob.status}")
        
        # Extrair time selecionado
        time_selecionado = [j for j in jogadores if value(x[j.id]) > 0.5]
        capitao = next((j for j in jogadores if value(c[j.id]) > 0.5), None)
        
        # Montar resultado
        time_result = {
            'id': 'temp',
            'esquema': esquema,
            'orcamento': orcamento,
            'custo_total': sum(j.preco for j in time_selecionado),
            'pontos_previstos': sum(j.pontos_esperados for j in time_selecionado) + 
                               (capitao.pontos_esperados if capitao else 0),
            'estrategia': estrategia,
            'jogadores': [
                {
                    'jogador': {
                        'id': j.id,
                        'nome': j.nome,
                        'apelido': j.apelido,
                        'posicao': j.posicao,
                        'clube': {'id': j.clube_id},
                        'preco': j.preco,
                    },
                    'posicao_time': 'CAPITAO' if capitao and j.id == capitao.id else 'TITULAR',
                    'preco_na_hora': j.preco,
                    'pontos_previstos': j.pontos_esperados,
                    'previsao': {
                        'pontos_esperados': j.pontos_esperados,
                        'desvio_padrao': j.desvio_padrao,
                    }
                }
                for j in time_selecionado
            ]
        }
        
        # Gerar alternativas (simplificado)
        alternativas = self._gerar_alternativas(
            jogadores, orcamento, esquema, time_selecionado
        )
        
        return {
            'time': time_result,
            'alternativas': alternativas
        }
    
    def _gerar_alternativas(
        self,
        jogadores: List[JogadorPrevisao],
        orcamento: float,
        esquema: str,
        time_principal: List[JogadorPrevisao],
        n_alternativas: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Gera alternativas de time variando alguns jogadores
        """
        alternativas = []
        ids_principal = {j.id for j in time_principal}
        
        # Estratégias diferentes para alternativas
        estrategias_alt = ['SEGURO', 'OUSADO']
        
        for i, estrategia in enumerate(estrategias_alt[:n_alternativas]):
            try:
                # Excluir alguns jogadores do time principal para forçar variação
                jogadores_excluidos = list(ids_principal)[i*2:(i+1)*2]
                jogadores_disponiveis = [
                    j for j in jogadores 
                    if j.id not in jogadores_excluidos
                ]
                
                # Criar nova otimização
                result = self.optimize(
                    [{'jogador': {
                        'id': j.id,
                        'nome': j.nome,
                        'apelido': j.apelido,
                        'posicao': j.posicao,
                        'clubeId': j.clube_id,
                        'preco': j.preco,
                        'status': j.status,
                    },
                    'pontosEsperados': j.pontos_esperados,
                    'desvioPadrao': j.desvio_padrao} for j in jogadores_disponiveis],
                    orcamento,
                    esquema,
                    estrategia
                )
                
                alt = result['time']
                alt['id'] = f'alt_{i}'
                alternativas.append(alt)
                
            except Exception as e:
                logger.warning(f"Erro ao gerar alternativa {i}: {e}")
                continue
        
        return alternativas

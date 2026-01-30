'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCartoletas, formatNumber } from '@/lib/utils';
import type { TimeRecomendado, Previsao } from '@/types';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Shield,
  Target
} from 'lucide-react';

interface TimeStatsProps {
  time: TimeRecomendado;
  previsoes: Record<string, Previsao>;
}

export function TimeStats({ time, previsoes }: TimeStatsProps) {
  const percentualOrcamento = (time.custoTotal / time.orcamento) * 100;
  const jogadoresPorClube = time.jogadores.reduce((acc, tj) => {
    const clube = tj.jogador.clube.abreviacao;
    acc[clube] = (acc[clube] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clubeMaisRepresentado = Object.entries(jogadoresPorClube)
    .sort((a, b) => b[1] - a[1])[0];

  const jogadoresMandantes = time.jogadores.filter(tj => {
    const prev = previsoes[tj.jogador.id];
    return prev?.ehMandante;
  }).length;

  const riscoMedio = time.jogadores.reduce((acc, tj) => {
    const prev = previsoes[tj.jogador.id];
    return acc + (prev?.desvioPadrao || 0);
  }, 0) / time.jogadores.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Orçamento */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Orçamento Utilizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCartoletas(time.custoTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            de {formatCartoletas(time.orcamento)} disponíveis
          </p>
          <Progress value={percentualOrcamento} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {formatNumber(percentualOrcamento)}% utilizado
          </p>
        </CardContent>
      </Card>

      {/* Pontuação Prevista */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pontuação Prevista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cartola-green">
            {formatNumber(time.pontosPrevistos)}
          </div>
          <p className="text-xs text-muted-foreground">
            pontos esperados na rodada
          </p>
          {time.pontosReais && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Real:</p>
              <p className={`font-semibold ${time.pontosReais >= time.pontosPrevistos ? 'text-green-500' : 'text-red-500'}`}>
                {formatNumber(time.pontosReais)} pts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estratégia */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Estratégia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge 
            variant={time.estrategia === 'SEGURO' ? 'default' : time.estrategia === 'OUSADO' ? 'destructive' : 'secondary'}
            className="text-sm"
          >
            {time.estrategia === 'SEGURO' ? 'Time Seguro' : 
             time.estrategia === 'OUSADO' ? 'Time Ousado' : 'Time Equilibrado'}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {time.estrategia === 'SEGURO' 
              ? 'Prioriza jogadores consistentes com menor variância'
              : time.estrategia === 'OUSADO'
              ? 'Prioriza jogadores com alto potencial de mitagem'
              : 'Balanceia consistência e potencial de pontuação'}
          </p>
        </CardContent>
      </Card>

      {/* Composição */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Composição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Esquema:</span>
            <span className="font-medium">{time.esquema}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jogadores:</span>
            <span className="font-medium">{time.jogadores.filter(j => j.posicaoTime === 'TITULAR').length} titulares</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Maior concentração:</span>
            <span className="font-medium">{clubeMaisRepresentado?.[0]} ({clubeMaisRepresentado?.[1]})</span>
          </div>
        </CardContent>
      </Card>

      {/* Mando de Campo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Mando de Campo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {jogadoresMandantes}/{time.jogadores.filter(j => j.posicaoTime === 'TITULAR').length}
          </div>
          <p className="text-xs text-muted-foreground">
            jogadores atuam em casa
          </p>
          <Progress 
            value={(jogadoresMandantes / time.jogadores.filter(j => j.posicaoTime === 'TITULAR').length) * 100} 
            className="mt-2" 
          />
        </CardContent>
      </Card>

      {/* Risco */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risco Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            riscoMedio < 2 ? 'text-green-500' : 
            riscoMedio < 4 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {formatNumber(riscoMedio)}
          </div>
          <p className="text-xs text-muted-foreground">
            desvio padrão médio da previsão
          </p>
          <div className="mt-2 text-xs">
            {riscoMedio < 2 ? (
              <span className="text-green-500">Baixo risco - Previsões confiáveis</span>
            ) : riscoMedio < 4 ? (
              <span className="text-yellow-500">Risco moderado - Alguma incerteza</span>
            ) : (
              <span className="text-red-500">Alto risco - Alta variabilidade</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

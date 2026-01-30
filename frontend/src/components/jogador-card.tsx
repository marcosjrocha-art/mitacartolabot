'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  POSICAO_LABELS, 
  STATUS_LABELS, 
  STATUS_COLORS,
  getPosicaoColor,
  formatCartoletas,
  formatNumber,
  getInitials 
} from '@/lib/utils';
import type { Jogador, Previsao } from '@/types';
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from 'lucide-react';

interface JogadorCardProps {
  jogador: Jogador;
  previsao?: Previsao;
  isCapitao?: boolean;
  onClick?: () => void;
  showPrevisao?: boolean;
}

export function JogadorCard({ 
  jogador, 
  previsao, 
  isCapitao = false, 
  onClick,
  showPrevisao = true 
}: JogadorCardProps) {
  const statusColor = STATUS_COLORS[jogador.status];
  const posicaoColor = getPosicaoColor(jogador.posicao);
  const isPrecoSubindo = jogador.precoVariacao > 0;
  const isPrecoCaindo = jogador.precoVariacao < 0;

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
        ${isCapitao ? 'ring-2 ring-cartola-accent' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={jogador.fotoUrl} alt={jogador.apelido} />
              <AvatarFallback className={posicaoColor}>
                {getInitials(jogador.apelido)}
              </AvatarFallback>
            </Avatar>
            {isCapitao && (
              <div className="absolute -top-1 -right-1 bg-cartola-accent text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                C
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">
                {jogador.apelido}
              </h4>
              {jogador.status !== 'PROVAVEL' && (
                <AlertTriangle className={`h-4 w-4 text-${statusColor}-500`} />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge 
                variant="secondary" 
                className={`${posicaoColor} text-white text-[10px] px-1.5 py-0`}
              >
                {POSICAO_LABELS[jogador.posicao]}
              </Badge>
              <span>{jogador.clube.abreviacao}</span>
              <Badge 
                variant="outline" 
                className={`text-[10px] status-${jogador.status.toLowerCase()}`}
              >
                {STATUS_LABELS[jogador.status]}
              </Badge>
            </div>

            {/* Preço e Média */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">C$</span>
                <span className="font-medium">{formatNumber(jogador.preco)}</span>
                {isPrecoSubindo && <TrendingUp className="h-3 w-3 text-green-500" />}
                {isPrecoCaindo && <TrendingDown className="h-3 w-3 text-red-500" />}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Média:</span>
                <span className="font-medium">{formatNumber(jogador.mediaPontos)}</span>
              </div>
            </div>

            {/* Previsão */}
            {showPrevisao && previsao && (
              <div className="mt-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Previsto:</span>
                    <span className="font-bold text-cartola-green">
                      {formatNumber(previsao.pontosEsperados)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ±{formatNumber(previsao.desvioPadrao)}
                    </span>
                  </div>
                  {previsao.ehMandante && (
                    <Shield className="h-3 w-3 text-green-500" title="Mandante" />
                  )}
                </div>
                {previsao.intervaloInferior && previsao.intervaloSuperior && (
                  <div className="text-[10px] text-muted-foreground mt-1">
                    Intervalo: {formatNumber(previsao.intervaloInferior)} - {formatNumber(previsao.intervaloSuperior)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

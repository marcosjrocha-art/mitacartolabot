'use client';

import { Card } from '@/components/ui/card';
import { JogadorCard } from './jogador-card';
import type { TimeJogador, Previsao } from '@/types';

interface TimeFieldProps {
  jogadores: TimeJogador[];
  previsoes: Record<string, Previsao>;
  esquema: string;
  onJogadorClick?: (jogador: TimeJogador) => void;
}

// Formações suportadas e suas posições
const FORMACOES: Record<string, { goleiro: number; zagueiros: number; laterais: number; meias: number; atacantes: number }> = {
  '4-3-3': { goleiro: 1, zagueiros: 2, laterais: 2, meias: 3, atacantes: 3 },
  '4-4-2': { goleiro: 1, zagueiros: 2, laterais: 2, meias: 4, atacantes: 2 },
  '3-4-3': { goleiro: 1, zagueiros: 3, laterais: 0, meias: 4, atacantes: 3 },
  '3-5-2': { goleiro: 1, zagueiros: 3, laterais: 0, meias: 5, atacantes: 2 },
  '4-5-1': { goleiro: 1, zagueiros: 2, laterais: 2, meias: 5, atacantes: 1 },
  '5-3-2': { goleiro: 1, zagueiros: 3, laterais: 2, meias: 3, atacantes: 2 },
  '4-3-2-1': { goleiro: 1, zagueiros: 2, laterais: 2, meias: 5, atacantes: 1 },
};

export function TimeField({ jogadores, previsoes, esquema, onJogadorClick }: TimeFieldProps) {
  const formacao = FORMACOES[esquema] || FORMACOES['4-3-3'];

  const goleiros = jogadores.filter(j => j.jogador.posicao === 'GOLEIRO');
  const zagueiros = jogadores.filter(j => j.jogador.posicao === 'ZAGUEIRO');
  const laterais = jogadores.filter(j => j.jogador.posicao === 'LATERAL');
  const meias = jogadores.filter(j => j.jogador.posicao === 'MEIA');
  const atacantes = jogadores.filter(j => j.jogador.posicao === 'ATACANTE');
  const tecnicos = jogadores.filter(j => j.jogador.posicao === 'TECNICO');

  const capitao = jogadores.find(j => j.posicaoTime === 'CAPITAO');

  const renderLinha = (jogadoresLinha: TimeJogador[], colunas: number) => (
    <div 
      className="grid gap-2 w-full"
      style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
    >
      {jogadoresLinha.map((tj) => (
        <JogadorCard
          key={tj.jogador.id}
          jogador={tj.jogador}
          previsao={previsoes[tj.jogador.id]}
          isCapitao={capitao?.jogador.id === tj.jogador.id}
          onClick={() => onJogadorClick?.(tj)}
        />
      ))}
    </div>
  );

  return (
    <Card className="p-6 bg-gradient-to-b from-green-900 to-green-800 text-white">
      {/* Campo de futebol estilizado */}
      <div className="relative">
        {/* Grama */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full field-pattern" />
        </div>

        <div className="relative space-y-6">
          {/* Técnico */}
          {tecnicos.length > 0 && (
            <div className="flex justify-center">
              {renderLinha(tecnicos, 1)}
            </div>
          )}

          {/* Atacantes */}
          {atacantes.length > 0 && (
            <div className="flex justify-center">
              {renderLinha(atacantes, Math.min(atacantes.length, 3))}
            </div>
          )}

          {/* Meias */}
          {meias.length > 0 && (
            <div className="flex justify-center">
              {renderLinha(meias, Math.min(meias.length, 4))}
            </div>
          )}

          {/* Laterais */}
          {laterais.length > 0 && (
            <div className="flex justify-center">
              {renderLinha(laterais, Math.min(laterais.length, 2))}
            </div>
          )}

          {/* Zagueiros */}
          {zagueiros.length > 0 && (
            <div className="flex justify-center">
              {renderLinha(zagueiros, Math.min(zagueiros.length, 3))}
            </div>
          )}

          {/* Goleiro */}
          {goleiros.length > 0 && (
            <div className="flex justify-center">
              {renderLinha(goleiros, 1)}
            </div>
          )}
        </div>

        {/* Legenda do capitão */}
        {capitao && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70">
            <div className="w-4 h-4 rounded-full bg-cartola-accent flex items-center justify-center text-[10px] font-bold text-black">
              C
            </div>
            <span>Capitão: {capitao.jogador.apelido}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

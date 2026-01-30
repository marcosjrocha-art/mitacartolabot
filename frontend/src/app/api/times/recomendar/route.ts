import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Esquemas táticos válidos
const ESQUEMAS: Record<string, { GOLEIRO: number; ZAGUEIRO: number; LATERAL: number; MEIA: number; ATACANTE: number; TECNICO: number }> = {
  '4-3-3': { GOLEIRO: 1, ZAGUEIRO: 2, LATERAL: 2, MEIA: 3, ATACANTE: 3, TECNICO: 1 },
  '4-4-2': { GOLEIRO: 1, ZAGUEIRO: 2, LATERAL: 2, MEIA: 4, ATACANTE: 2, TECNICO: 1 },
  '3-4-3': { GOLEIRO: 1, ZAGUEIRO: 3, LATERAL: 0, MEIA: 4, ATACANTE: 3, TECNICO: 1 },
  '3-5-2': { GOLEIRO: 1, ZAGUEIRO: 3, LATERAL: 0, MEIA: 5, ATACANTE: 2, TECNICO: 1 },
  '4-5-1': { GOLEIRO: 1, ZAGUEIRO: 2, LATERAL: 2, MEIA: 5, ATACANTE: 1, TECNICO: 1 },
  '5-3-2': { GOLEIRO: 1, ZAGUEIRO: 3, LATERAL: 2, MEIA: 3, ATACANTE: 2, TECNICO: 1 },
};

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      orcamento = 100, 
      esquema = '4-3-3', 
      estrategia = 'EQUILIBRADO',
      evitarClubes = [],
      priorizarConsistencia = false,
      priorizarPotencial = true,
    } = body;

    // Buscar rodada atual
    const rodada = await prisma.rodada.findFirst({
      where: { status: 'ABERTA' },
      orderBy: { numero: 'desc' },
    });

    if (!rodada) {
      return NextResponse.json(
        { error: 'Nenhuma rodada aberta encontrada' },
        { status: 400 }
      );
    }

    // Buscar previsões da rodada
    const previsoes = await prisma.previsao.findMany({
      where: { rodadaId: rodada.id },
      include: {
        jogador: {
          include: {
            clube: true,
          },
        },
      },
    });

    if (previsoes.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma previsão disponível para esta rodada' },
        { status: 400 }
      );
    }

    // Filtrar jogadores disponíveis
    let jogadoresDisponiveis = previsoes.filter(
      (p) => p.jogador.status === 'PROVAVEL' && !evitarClubes.includes(p.jogador.clubeId)
    );

    // Aplicar estratégia
    if (estrategia === 'SEGURO' || priorizarConsistencia) {
      // Priorizar jogadores com menor desvio padrão (mais consistentes)
      jogadoresDisponiveis = jogadoresDisponiveis.sort(
        (a, b) => (a.desvioPadrao / a.pontosEsperados) - (b.desvioPadrao / b.pontosEsperados)
      );
    } else if (estrategia === 'OUSADO' || priorizarPotencial) {
      // Priorizar jogadores com maior potencial de pontuação
      jogadoresDisponiveis = jogadoresDisponiveis.sort(
        (a, b) => b.pontosEsperados - a.pontosEsperados
      );
    }

    // Montar time ótimo (algoritmo guloso simplificado)
    const formacao = ESQUEMAS[esquema] || ESQUEMAS['4-3-3'];
    const time: typeof jogadoresDisponiveis = [];
    let custoTotal = 0;

    // Selecionar por posição
    const posicoes = ['GOLEIRO', 'ZAGUEIRO', 'LATERAL', 'MEIA', 'ATACANTE', 'TECNICO'] as const;
    
    for (const posicao of posicoes) {
      const quantidade = formacao[posicao];
      if (quantidade === 0) continue;

      const jogadoresPosicao = jogadoresDisponiveis.filter(
        (p) => p.jogador.posicao === posicao && !time.find((t) => t.jogador.id === p.jogador.id)
      );

      for (let i = 0; i < Math.min(quantidade, jogadoresPosicao.length); i++) {
        const jogador = jogadoresPosicao[i];
        if (custoTotal + jogador.jogador.preco <= orcamento) {
          time.push(jogador);
          custoTotal += jogador.jogador.preco;
        }
      }
    }

    // Selecionar capitão (maior pontuação esperada)
    const capitao = time.length > 0 
      ? time.reduce((max, p) => p.pontosEsperados > max.pontosEsperados ? p : max, time[0])
      : null;

    const pontosPrevistos = time.reduce((sum, p) => sum + p.pontosEsperados, 0);

    // Criar time salvo
    const timeSalvo = await prisma.timeSalvo.create({
      data: {
        userId: user.userId,
        rodadaId: rodada.id,
        esquema,
        orcamento,
        custoTotal,
        pontosPrevistos,
        estrategia,
        jogadores: {
          create: time.map((tj) => ({
            jogadorId: tj.jogador.id,
            posicaoTime: capitao?.jogador.id === tj.jogador.id ? 'CAPITAO' : 'TITULAR',
            ordem: 0,
            precoNaHora: tj.jogador.preco,
            pontosPrevistos: tj.pontosEsperados,
          })),
        },
      },
      include: {
        jogadores: {
          include: {
            jogador: {
              include: {
                clube: true,
              },
            },
          },
        },
      },
    });

    // Gerar alternativas (variações)
    const alternativas = await gerarAlternativas(
      user.userId,
      rodada.id,
      orcamento,
      esquema,
      previsoes,
      evitarClubes
    );

    return NextResponse.json({
      time: timeSalvo,
      alternativas,
    });
  } catch (error) {
    console.error('Erro ao recomendar time:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function gerarAlternativas(
  userId: string,
  rodadaId: string,
  orcamento: number,
  esquema: string,
  previsoes: any[],
  evitarClubes: string[]
) {
  const estrategias = ['SEGURO', 'OUSADO'];
  const alternativas = [];

  for (const estrategia of estrategias) {
    // Simplified alternative generation
    const alt = await prisma.timeSalvo.create({
      data: {
        userId,
        rodadaId,
        esquema,
        orcamento,
        custoTotal: 0,
        pontosPrevistos: 0,
        estrategia: estrategia as any,
        jogadores: {
          create: [],
        },
      },
    });
    alternativas.push(alt);
  }

  return alternativas;
}

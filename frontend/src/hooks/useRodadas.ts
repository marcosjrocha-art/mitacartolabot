'use client';

import { useState, useEffect, useCallback } from 'react';
import { rodadasApi } from '@/lib/api';
import type { Rodada, Jogo } from '@/types';

export function useRodadas() {
  const [rodadas, setRodadas] = useState<Rodada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRodadas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await rodadasApi.list();
      setRodadas(response.rodadas as Rodada[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar rodadas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRodadas();
  }, [fetchRodadas]);

  return {
    rodadas,
    isLoading,
    error,
    refetch: fetchRodadas,
  };
}

export function useRodadaAtual() {
  const [rodada, setRodada] = useState<Rodada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRodada = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await rodadasApi.getAtual();
        setRodada(response.rodada as Rodada);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar rodada');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRodada();
  }, []);

  return {
    rodada,
    isLoading,
    error,
  };
}

export function useJogosRodada(rodadaId: string) {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJogos = async () => {
      if (!rodadaId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await rodadasApi.getJogos(rodadaId);
        setJogos(response.jogos as Jogo[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar jogos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJogos();
  }, [rodadaId]);

  return {
    jogos,
    isLoading,
    error,
  };
}

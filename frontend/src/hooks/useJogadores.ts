'use client';

import { useState, useEffect, useCallback } from 'react';
import { jogadoresApi } from '@/lib/api';
import type { Jogador } from '@/types';

interface UseJogadoresOptions {
  posicao?: string;
  clubeId?: string;
  search?: string;
}

export function useJogadores(options: UseJogadoresOptions = {}) {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchJogadores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await jogadoresApi.list(options);
      setJogadores(response.jogadores as Jogador[]);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogadores');
    } finally {
      setIsLoading(false);
    }
  }, [options.posicao, options.clubeId, options.search]);

  useEffect(() => {
    fetchJogadores();
  }, [fetchJogadores]);

  return {
    jogadores,
    isLoading,
    error,
    total,
    refetch: fetchJogadores,
  };
}

export function useJogador(id: string) {
  const [jogador, setJogador] = useState<Jogador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJogador = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await jogadoresApi.get(id);
        setJogador(response.jogador as Jogador);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar jogador');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJogador();
    }
  }, [id]);

  return {
    jogador,
    isLoading,
    error,
  };
}

export function useJogadorHistorico(id: string) {
  const [historico, setHistorico] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await jogadoresApi.getHistorico(id);
        setHistorico(response.historico);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHistorico();
    }
  }, [id]);

  return {
    historico,
    isLoading,
    error,
  };
}

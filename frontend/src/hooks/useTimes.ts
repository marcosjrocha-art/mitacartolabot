'use client';

import { useState, useCallback } from 'react';
import { timesApi } from '@/lib/api';
import type { TimeRecomendado, ConfiguracaoTime, Estrategia } from '@/types';

interface GerarTimeParams {
  orcamento: number;
  esquema: string;
  estrategia: Estrategia;
  evitarClubes?: string[];
  priorizarConsistencia?: boolean;
  priorizarPotencial?: boolean;
}

export function useTimes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recomendarTime = useCallback(async (params: GerarTimeParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await timesApi.recomendar(params);
      return {
        success: true,
        time: response.time as TimeRecomendado,
        alternativas: response.alternativas as TimeRecomendado[],
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao gerar time';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const salvarTime = useCallback(async (timeId: string, nome: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await timesApi.salvar(timeId, nome);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar time';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    recomendarTime,
    salvarTime,
  };
}

export function useTimesSalvos() {
  const [times, setTimes] = useState<TimeRecomendado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await timesApi.list();
      setTimes(response.times as TimeRecomendado[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar times');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    times,
    isLoading,
    error,
    refetch: fetchTimes,
  };
}

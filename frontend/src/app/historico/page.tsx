'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ESTRATEGIA_LABELS, formatNumber } from '@/lib/utils';
import { useTimesSalvos } from '@/hooks/useTimes';
import { useRodadas } from '@/hooks/useRodadas';
import { Trophy, TrendingUp, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { TimeRecomendado, Rodada } from '@/types';

export default function HistoricoPage() {
  const { times, isLoading: isLoadingTimes } = useTimesSalvos();
  const { rodadas, isLoading: isLoadingRodadas } = useRodadas();
  const [metricas, setMetricas] = useState<any>(null);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const response = await fetch('/api/admin/metricas');
        if (response.ok) {
          setMetricas(await response.json());
        }
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      }
    };

    fetchMetricas();
  }, []);

  const acuraciaData = rodadas
    .filter((r: Rodada) => r.maeModelo)
    .map((r: Rodada) => ({
      rodada: `R${r.numero}`,
      mae: r.maeModelo,
      rmse: r.rmseModelo,
    }));

  const pontuacaoData = times.map((t: TimeRecomendado) => ({
    nome: `R${t.rodadaId}`,
    previsto: t.pontosPrevistos,
    real: t.pontosReais || 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">
            Acompanhe a evolução do modelo e seus resultados
          </p>
        </div>

        <Tabs defaultValue="times">
          <TabsList>
            <TabsTrigger value="times" className="gap-2">
              <Trophy className="h-4 w-4" />
              Meus Times
            </TabsTrigger>
            <TabsTrigger value="metricas" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas do Modelo
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Evolução
            </TabsTrigger>
          </TabsList>

          <TabsContent value="times" className="mt-6">
            {isLoadingTimes ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : times.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum time salvo</h3>
                  <p className="text-muted-foreground">
                    Gere e salve times para acompanhar seu histórico
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {times.map((time: TimeRecomendado) => (
                  <Card key={time.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{time.nome}</h3>
                            <Badge variant="outline">{time.esquema}</Badge>
                            <Badge 
                              variant={time.estrategia === 'SEGURO' ? 'default' : time.estrategia === 'OUSADO' ? 'destructive' : 'secondary'}
                            >
                              {ESTRATEGIA_LABELS[time.estrategia]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Rodada {time.rodadaId} • Criado em {new Date(time.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Previsto</div>
                              <div className="font-semibold text-cartola-green">
                                {formatNumber(time.pontosPrevistos)} pts
                              </div>
                            </div>
                            {time.pontosReais && (
                              <div>
                                <div className="text-sm text-muted-foreground">Real</div>
                                <div className={`font-semibold ${
                                  time.pontosReais >= time.pontosPrevistos ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {formatNumber(time.pontosReais)} pts
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="metricas" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">MAE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {metricas?.mae?.toFixed(2) || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mean Absolute Error
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {metricas?.rmse?.toFixed(2) || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Root Mean Square Error
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">NDCG</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {metricas?.ndcg?.toFixed(3) || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Normalized Discounted Cumulative Gain
                  </p>
                </CardContent>
              </Card>
            </div>

            {acuraciaData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Acurácia por Rodada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={acuraciaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rodada" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="mae" stroke="#00A650" name="MAE" />
                        <Line type="monotone" dataKey="rmse" stroke="#fbbf24" name="RMSE" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evolucao" className="mt-6">
            {pontuacaoData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Previsão vs Realidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pontuacaoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="previsto" fill="#00A650" name="Previsto" />
                        <Bar dataKey="real" fill="#3b82f6" name="Real" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

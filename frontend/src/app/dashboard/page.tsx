'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight,
  Zap,
  BarChart3,
  Target
} from 'lucide-react';
import type { Rodada, TimeRecomendado, DashboardStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rodadaAtual, setRodadaAtual] = useState<Rodada | null>(null);
  const [ultimosTimes, setUltimosTimes] = useState<TimeRecomendado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, rodadaRes, timesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/rodadas/atual'),
          fetch('/api/times?limit=3'),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (rodadaRes.ok) setRodadaAtual(await rodadaRes.json());
        if (timesRes.ok) setUltimosTimes((await timesRes.json()).times);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Acompanhe suas recomendações e métricas
            </p>
          </div>
          <Link href="/gerar-time">
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              Gerar Time
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rodada Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rodadaAtual ? `Rodada ${rodadaAtual.numero}` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {rodadaAtual?.status === 'ABERTA' 
                  ? 'Mercado aberto' 
                  : rodadaAtual?.status === 'ENCERRADA'
                  ? 'Aguardando processamento'
                  : 'Aguardando'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Times Gerados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.timesGerados || 0}</div>
              <p className="text-xs text-muted-foreground">
                nesta temporada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Acurácia do Modelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.mediaAcuracia ? `${stats.mediaAcuracia.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                média das últimas rodadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Jogadores na Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJogadores || 0}</div>
              <p className="text-xs text-muted-foreground">
                de {stats?.totalRodadas || 0} rodadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rodada Atual */}
            {rodadaAtual && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Rodada {rodadaAtual.numero}</CardTitle>
                      <CardDescription>
                        Período: {new Date(rodadaAtual.inicio).toLocaleDateString('pt-BR')} - {new Date(rodadaAtual.fim).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={rodadaAtual.status === 'ABERTA' ? 'default' : 'secondary'}
                    >
                      {rodadaAtual.status === 'ABERTA' ? 'Aberta' : 
                       rodadaAtual.status === 'ENCERRADA' ? 'Encerrada' : 'Processada'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {rodadaAtual.status === 'ABERTA' ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        O mercado está aberto! Gere seu time recomendado para esta rodada.
                      </p>
                      <Link href="/gerar-time">
                        <Button className="gap-2">
                          <Zap className="h-4 w-4" />
                          Gerar Time da Rodada
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : rodadaAtual.status === 'ENCERRADA' ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        A rodada foi encerrada. Aguarde o processamento dos resultados.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Progress value={66} className="w-32" />
                        <span className="text-muted-foreground">Processando...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Rodada processada! Veja como o modelo se saiu.
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold">{rodadaAtual.maeModelo?.toFixed(2) || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">MAE</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold">{rodadaAtual.rmseModelo?.toFixed(2) || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">RMSE</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-lg font-semibold">{rodadaAtual.ndcgModelo?.toFixed(3) || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">NDCG</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Últimos Times */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Últimos Times Gerados</CardTitle>
                  <Link href="/historico">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ver todos
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {ultimosTimes.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum time gerado ainda</p>
                    <Link href="/gerar-time" className="mt-4 inline-block">
                      <Button>Gerar Primeiro Time</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ultimosTimes.map((time) => (
                      <div 
                        key={time.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium">{time.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            Rodada {time.rodadaId} • {time.esquema}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-cartola-green">
                            {time.pontosPrevistos.toFixed(2)} pts
                          </div>
                          <div className="text-sm text-muted-foreground">
                            C$ {time.custoTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/gerar-time">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Zap className="h-4 w-4" />
                    Gerar Novo Time
                  </Button>
                </Link>
                <Link href="/jogadores">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Explorar Jogadores
                  </Button>
                </Link>
                <Link href="/historico">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Ver Histórico
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Dica */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Dica do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Jogadores em casa tendem a pontuar 15% a mais em média. 
                  Priorize atletas que jogam em seus estádios!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

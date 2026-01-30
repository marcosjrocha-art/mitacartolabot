'use client';

import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  POSICAO_LABELS, 
  STATUS_LABELS,
  getPosicaoColor,
  formatCartoletas,
  formatNumber,
  getInitials 
} from '@/lib/utils';
import { useJogador, useJogadorHistorico } from '@/hooks/useJogadores';
import { TrendingUp, TrendingDown, Calendar, Trophy, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function JogadorPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { jogador, isLoading: isLoadingJogador } = useJogador(id);
  const { historico, isLoading: isLoadingHistorico } = useJogadorHistorico(id);

  if (isLoadingJogador) {
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

  if (!jogador) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Jogador não encontrado</p>
          </div>
        </main>
      </div>
    );
  }

  const posicaoColor = getPosicaoColor(jogador.posicao);
  const isPrecoSubindo = jogador.precoVariacao > 0;
  const isPrecoCaindo = jogador.precoVariacao < 0;

  const chartData = historico.map((h: { rodada: { numero: number }; pontos: number }) => ({
    rodada: `R${h.rodada.numero}`,
    pontos: h.pontos,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={jogador.fotoUrl} alt={jogador.apelido} />
                <AvatarFallback className={`${posicaoColor} text-2xl`}>
                  {getInitials(jogador.apelido)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{jogador.apelido}</h1>
                  <Badge 
                    variant="secondary" 
                    className={`${posicaoColor} text-white`}
                  >
                    {POSICAO_LABELS[jogador.posicao]}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{jogador.nome}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-2">
                    <img 
                      src={jogador.clube.escudoUrl || ''} 
                      alt={jogador.clube.abreviacao}
                      className="h-6 w-6"
                    />
                    {jogador.clube.nome}
                  </span>
                  <Badge variant="outline" className={`status-${jogador.status.toLowerCase()}`}>
                    {STATUS_LABELS[jogador.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{formatCartoletas(jogador.preco)}</span>
                {isPrecoSubindo && <TrendingUp className="h-5 w-5 text-green-500" />}
                {isPrecoCaindo && <TrendingDown className="h-5 w-5 text-red-500" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Variação: {formatNumber(jogador.precoVariacao)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(jogador.mediaPontos)}</div>
              <p className="text-xs text-muted-foreground">
                pontos por jogo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Jogos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jogador.jogos}</div>
              <p className="text-xs text-muted-foreground">
                partidas disputadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(jogador.mediaPontos * jogador.jogos)}
              </div>
              <p className="text-xs text-muted-foreground">
                pontos na temporada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="historico">
          <TabsList>
            <TabsTrigger value="historico" className="gap-2">
              <Calendar className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="scouts" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Scouts
            </TabsTrigger>
            <TabsTrigger value="previsoes" className="gap-2">
              <Trophy className="h-4 w-4" />
              Previsões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pontuação</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rodada" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="pontos" 
                          stroke="#00A650" 
                          strokeWidth={2}
                          dot={{ fill: '#00A650' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum histórico disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scouts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Detalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Scouts detalhados em breve
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="previsoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Previsões do Modelo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Previsões em breve
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeField } from '@/components/time-field';
import { TimeStats } from '@/components/time-stats';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { formatCartoletas, ESTRATEGIA_LABELS } from '@/lib/utils';
import type { TimeRecomendado, Previsao, Estrategia } from '@/types';
import { 
  Trophy, 
  AlertCircle, 
  RefreshCw, 
  Save,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const ESQUEMAS = [
  { value: '4-3-3', label: '4-3-3 (Clássico)', desc: '4 zagueiros, 3 meias, 3 atacantes' },
  { value: '4-4-2', label: '4-4-2 (Equilibrado)', desc: '4 zagueiros, 4 meias, 2 atacantes' },
  { value: '3-4-3', label: '3-4-3 (Ofensivo)', desc: '3 zagueiros, 4 meias, 3 atacantes' },
  { value: '3-5-2', label: '3-5-2 (Compacto)', desc: '3 zagueiros, 5 meias, 2 atacantes' },
  { value: '4-5-1', label: '4-5-1 (Defensivo)', desc: '4 zagueiros, 5 meias, 1 atacante' },
  { value: '5-3-2', label: '5-3-2 (Fechado)', desc: '5 zagueiros, 3 meias, 2 atacantes' },
];

const ESTRATEGIAS: { value: Estrategia; label: string; desc: string; icon: typeof Shield }[] = [
  { 
    value: 'SEGURO', 
    label: 'Time Seguro', 
    desc: 'Prioriza consistência e jogadores com baixa variância',
    icon: Shield 
  },
  { 
    value: 'EQUILIBRADO', 
    label: 'Time Equilibrado', 
    desc: 'Balanceia consistência e potencial de pontuação',
    icon: Trophy 
  },
  { 
    value: 'OUSADO', 
    label: 'Time Ousado', 
    desc: 'Prioriza jogadores com alto potencial de mitagem',
    icon: Zap 
  },
];

export default function GerarTimePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timeGerado, setTimeGerado] = useState<TimeRecomendado | null>(null);
  const [alternativas, setAlternativas] = useState<TimeRecomendado[]>([]);
  const [previsoes, setPrevisoes] = useState<Record<string, Previsao>>({});
  const [nomeTime, setNomeTime] = useState('');

  const [config, setConfig] = useState({
    orcamento: 100,
    esquema: '4-3-3',
    estrategia: 'EQUILIBRADO' as Estrategia,
    evitarClubes: [] as string[],
    priorizarConsistencia: false,
    priorizarPotencial: true,
  });

  const handleGerarTime = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/times/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar time');
      }

      const data = await response.json();
      setTimeGerado(data.time);
      setAlternativas(data.alternativas);
      
      // Criar mapa de previsões
      const previsoesMap: Record<string, Previsao> = {};
      data.time.jogadores.forEach((tj: { jogador: { id: string | number }; previsao: Previsao }) => {
        if (tj.previsao) {
          previsoesMap[tj.jogador.id] = tj.previsao;
        }
      });
      setPrevisoes(previsoesMap);

      toast.success('Time gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar time', error instanceof Error ? error.message : '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarTime = async () => {
    if (!timeGerado) return;
    
    try {
      await fetch(`/api/times/${timeGerado.id}/salvar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeTime || 'Meu Time' }),
      });
      toast.success('Time salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar time');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gerar Time</h1>
          <p className="text-muted-foreground">
            Configure suas preferências e gere o time ideal
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configurações */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Orçamento */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Orçamento</Label>
                    <span className="text-sm font-medium">
                      {formatCartoletas(config.orcamento)}
                    </span>
                  </div>
                  <Slider
                    value={[config.orcamento]}
                    onValueChange={([value]) => setConfig({ ...config, orcamento: value })}
                    min={50}
                    max={200}
                    step={0.1}
                  />
                </div>

                {/* Esquema */}
                <div className="space-y-2">
                  <Label>Esquema Tático</Label>
                  <Select
                    value={config.esquema}
                    onValueChange={(value) => setConfig({ ...config, esquema: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESQUEMAS.map((esquema) => (
                        <SelectItem key={esquema.value} value={esquema.value}>
                          <div>
                            <div>{esquema.label}</div>
                            <div className="text-xs text-muted-foreground">{esquema.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estratégia */}
                <div className="space-y-2">
                  <Label>Estratégia</Label>
                  <div className="space-y-2">
                    {ESTRATEGIAS.map((est) => {
                      const Icon = est.icon;
                      return (
                        <button
                          key={est.value}
                          onClick={() => setConfig({ ...config, estrategia: est.value })}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            config.estrategia === est.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${
                              config.estrategia === est.value ? 'text-primary' : ''
                            }`} />
                            <span className="font-medium">{est.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{est.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferências */}
                <div className="space-y-3">
                  <Label>Preferências</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Priorizar consistência</span>
                    <Switch
                      checked={config.priorizarConsistencia}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, priorizarConsistencia: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Priorizar potencial</span>
                    <Switch
                      checked={config.priorizarPotencial}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, priorizarPotencial: checked })
                      }
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGerarTime} 
                  isLoading={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Trophy className="h-5 w-5" />
                  Gerar Time
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resultado */}
          <div className="lg:col-span-2">
            {!timeGerado ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum time gerado</h3>
                  <p className="text-muted-foreground max-w-md">
                    Configure suas preferências e clique em "Gerar Time" para receber 
                    recomendações personalizadas baseadas em Machine Learning.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="principal" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="principal">Time Principal</TabsTrigger>
                  <TabsTrigger value="alternativas">Alternativas</TabsTrigger>
                  <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
                </TabsList>

                <TabsContent value="principal" className="space-y-6">
                  {/* Campo */}
                  <TimeField 
                    jogadores={timeGerado.jogadores}
                    previsoes={previsoes}
                    esquema={timeGerado.esquema}
                  />

                  {/* Ações */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Nome do time (opcional)"
                        value={nomeTime}
                        onChange={(e) => setNomeTime(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={handleGerarTime} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Regenerar
                    </Button>
                    <Button onClick={handleSalvarTime} className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                  </div>

                  {/* Resumo */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-bold">{formatCartoletas(timeGerado.custoTotal)}</div>
                      <div className="text-xs text-muted-foreground">Custo Total</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <div className="text-2xl font-bold text-cartola-green">
                        {timeGerado.pontosPrevistos.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Pontos Previstos</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <Badge variant={timeGerado.estrategia === 'SEGURO' ? 'default' : timeGerado.estrategia === 'OUSADO' ? 'destructive' : 'secondary'}>
                        {ESTRATEGIA_LABELS[timeGerado.estrategia]}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">Estratégia</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alternativas">
                  <div className="space-y-4">
                    {alternativas.map((alt, index) => (
                      <Card key={alt.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">Alternativa {index + 1}</div>
                              <div className="text-sm text-muted-foreground">
                                {alt.esquema} • {ESTRATEGIA_LABELS[alt.estrategia]}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-cartola-green">
                                {alt.pontosPrevistos.toFixed(2)} pts
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatCartoletas(alt.custoTotal)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="estatisticas">
                  <TimeStats time={timeGerado} previsoes={previsoes} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Play, 
  Brain, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Loader2,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

interface Job {
  id: string;
  jobType: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  error?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchMetricas();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Erro ao carregar jobs:', error);
    }
  };

  const fetchMetricas = async () => {
    try {
      const response = await fetch('/api/admin/metricas');
      if (response.ok) {
        const data = await response.json();
        setMetricas(data.metricas);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const handleImportCSV = async () => {
    if (!uploadFile) {
      setError('Selecione um arquivo CSV');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await fetch('/api/admin/importar/csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao importar CSV');
      }

      setSuccess('Importação iniciada com sucesso!');
      setUploadFile(null);
      fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTreinarModelo = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/modelos/treinar', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar treinamento');
      }

      setSuccess('Treinamento iniciado com sucesso!');
      fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao treinar modelo');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Concluído</Badge>;
      case 'PROCESSANDO':
        return <Badge variant="default"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processando</Badge>;
      case 'ERRO':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Erro</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie dados, modelos e jobs do sistema
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="importar">
          <TabsList>
            <TabsTrigger value="importar" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar Dados
            </TabsTrigger>
            <TabsTrigger value="modelos" className="gap-2">
              <Brain className="h-4 w-4" />
              Modelos
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <Database className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="metricas" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="importar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Importar Dados via CSV</CardTitle>
                <CardDescription>
                  Faça upload de arquivos CSV para importar jogadores, rodadas e resultados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Arquivo CSV</Label>
                  <div className="flex gap-4">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                    <Button 
                      onClick={handleImportCSV} 
                      isLoading={isLoading}
                      disabled={!uploadFile}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importar
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Formatos Suportados
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>jogadores.csv</strong>: Dados dos jogadores (nome, posição, clube, preço)</li>
                    <li>• <strong>rodadas.csv</strong>: Informações das rodadas (número, datas)</li>
                    <li>• <strong>pontuacoes.csv</strong>: Pontuações por jogador por rodada</li>
                    <li>• <strong>scouts.csv</strong>: Estatísticas detalhadas dos jogadores</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modelos" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Treinar Modelo</CardTitle>
                  <CardDescription>
                    Inicie o treinamento do modelo com os dados mais recentes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    O treinamento pode levar alguns minutos dependendo da quantidade de dados.
                    O modelo será atualizado automaticamente após a conclusão.
                  </p>
                  <Button 
                    onClick={handleTreinarModelo} 
                    isLoading={isLoading}
                    className="w-full"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Iniciar Treinamento
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status do Modelo</CardTitle>
                  <CardDescription>
                    Informações sobre o modelo atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versão:</span>
                      <span className="font-medium">{metricas?.versao || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Último treinamento:</span>
                      <span className="font-medium">
                        {metricas?.ultimoTreinamento 
                          ? new Date(metricas.ultimoTreinamento).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de amostras:</span>
                      <span className="font-medium">{metricas?.totalAmostras || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Jobs em Execução</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchJobs}>
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum job encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.jobType}</TableCell>
                          <TableCell>{getStatusBadge(job.status)}</TableCell>
                          <TableCell>
                            {new Date(job.createdAt).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {job.startedAt && job.endedAt
                              ? `${Math.round((new Date(job.endedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s`
                              : job.startedAt
                              ? 'Em andamento...'
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metricas" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">MAE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metricas?.mae?.toFixed(2) || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metricas?.rmse?.toFixed(2) || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Root Mean Square Error</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">NDCG</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metricas?.ndcg?.toFixed(3) || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Ranking Quality</p>
                </CardContent>
              </Card>
            </div>

            {metricas?.maePorPosicao && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>MAE por Posição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(metricas.maePorPosicao).map(([posicao, mae]) => (
                      <div key={posicao} className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{(mae as number).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{posicao}</div>
                      </div>
                    ))}
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

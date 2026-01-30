'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  POSICAO_LABELS, 
  STATUS_LABELS, 
  STATUS_COLORS,
  getPosicaoColor,
  formatCartoletas,
  formatNumber,
  getInitials 
} from '@/lib/utils';
import { useJogadores } from '@/hooks/useJogadores';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import type { Jogador, Posicao } from '@/types';

const POSICOES: { value: string; label: string }[] = [
  { value: '', label: 'Todas as posições' },
  { value: 'GOLEIRO', label: 'Goleiro' },
  { value: 'ZAGUEIRO', label: 'Zagueiro' },
  { value: 'LATERAL', label: 'Lateral' },
  { value: 'MEIA', label: 'Meia' },
  { value: 'ATACANTE', label: 'Atacante' },
  { value: 'TECNICO', label: 'Técnico' },
];

function JogadorRow({ jogador }: { jogador: Jogador }) {
  const statusColor = STATUS_COLORS[jogador.status];
  const posicaoColor = getPosicaoColor(jogador.posicao);
  const isPrecoSubindo = jogador.precoVariacao > 0;
  const isPrecoCaindo = jogador.precoVariacao < 0;

  return (
    <Link href={`/jogadores/${jogador.id}`}>
      <Card className="card-hover cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={jogador.fotoUrl} alt={jogador.apelido} />
              <AvatarFallback className={posicaoColor}>
                {getInitials(jogador.apelido)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{jogador.apelido}</h4>
                <Badge 
                  variant="secondary" 
                  className={`${posicaoColor} text-white text-[10px] px-1.5 py-0`}
                >
                  {POSICAO_LABELS[jogador.posicao]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{jogador.clube.abreviacao}</span>
                <span>•</span>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] status-${jogador.status.toLowerCase()}`}
                >
                  {STATUS_LABELS[jogador.status]}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium">{formatCartoletas(jogador.preco)}</span>
                {isPrecoSubindo && <TrendingUp className="h-4 w-4 text-green-500" />}
                {isPrecoCaindo && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
              <div className="text-xs text-muted-foreground">
                Média: {formatNumber(jogador.mediaPontos)}
              </div>
              <div className="text-xs text-muted-foreground">
                {jogador.jogos} jogos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function JogadoresPage() {
  const [search, setSearch] = useState('');
  const [posicao, setPosicao] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { jogadores, isLoading, error, total } = useJogadores({
    search: debouncedSearch,
    posicao: posicao || undefined,
  });

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Jogadores</h1>
          <p className="text-muted-foreground">
            Explore os jogadores do Brasileirão e suas estatísticas
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jogador..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={posicao} onValueChange={setPosicao}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSICOES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resultados */}
        <div className="mb-4 text-sm text-muted-foreground">
          {total} jogadores encontrados
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : jogadores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum jogador encontrado</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {jogadores.map((jogador) => (
              <JogadorRow key={jogador.id} jogador={jogador} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

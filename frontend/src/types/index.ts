// Tipos principais do sistema

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Clube {
  id: string;
  cartolaId?: number;
  nome: string;
  abreviacao: string;
  escudoUrl?: string;
  cores: string[];
  eloOfensivo: number;
  eloDefensivo: number;
  eloGeral: number;
}

export interface Jogador {
  id: string;
  cartolaId?: number;
  nome: string;
  apelido: string;
  posicao: Posicao;
  posicaoLabel: string;
  clubeId: string;
  clube: Clube;
  preco: number;
  precoVariacao: number;
  mediaPontos: number;
  jogos: number;
  status: Status;
  statusLabel: string;
  fotoUrl?: string;
}

export type Posicao = 'GOLEIRO' | 'ZAGUEIRO' | 'LATERAL' | 'MEIA' | 'ATACANTE' | 'TECNICO';

export type Status = 'PROVAVEL' | 'DUVIDA' | 'SUSPENSO' | 'LESIONADO' | 'NULO';

export const POSICAO_LABELS: Record<Posicao, string> = {
  GOLEIRO: 'Goleiro',
  ZAGUEIRO: 'Zagueiro',
  LATERAL: 'Lateral',
  MEIA: 'Meia',
  ATACANTE: 'Atacante',
  TECNICO: 'Técnico',
};

export const STATUS_LABELS: Record<Status, string> = {
  PROVAVEL: 'Provável',
  DUVIDA: 'Dúvida',
  SUSPENSO: 'Suspenso',
  LESIONADO: 'Lesionado',
  NULO: 'Nulo',
};

export const STATUS_COLORS: Record<Status, string> = {
  PROVAVEL: 'green',
  DUVIDA: 'yellow',
  SUSPENSO: 'red',
  LESIONADO: 'red',
  NULO: 'gray',
};

export interface Rodada {
  id: string;
  numero: number;
  inicio: string;
  fim: string;
  status: StatusRodada;
  maeModelo?: number;
  rmseModelo?: number;
  ndcgModelo?: number;
}

export type StatusRodada = 'AGUARDANDO' | 'ABERTA' | 'ENCERRADA' | 'PROCESSADA';

export const STATUS_RODADA_LABELS: Record<StatusRodada, string> = {
  AGUARDANDO: 'Aguardando',
  ABERTA: 'Aberta',
  ENCERRADA: 'Encerrada',
  PROCESSADA: 'Processada',
};

export interface Jogo {
  id: string;
  rodadaId: string;
  mandante: Clube;
  visitante: Clube;
  data: string;
  local?: string;
  golsMandante?: number;
  golsVisitante?: number;
  probMandanteVence?: number;
  probEmpate?: number;
  probVisitanteVence?: number;
}

export interface Scout {
  id: string;
  jogadorId: string;
  rodadaId: string;
  gols: number;
  assistencias: number;
  finalizacoes: number;
  finalizacoesFora: number;
  finalizacoesTrave: number;
  passesCertos: number;
  desarmes: number;
  defesas: number;
  defesasDificeis: number;
  golsSofridos: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  pontos: number;
}

export interface Pontuacao {
  id: string;
  jogadorId: string;
  rodadaId: string;
  pontos: number;
  preco: number;
  media: number;
  jogos: number;
  varricao: number;
}

export interface Previsao {
  id: string;
  jogadorId: string;
  jogador: Jogador;
  rodadaId: string;
  pontosEsperados: number;
  desvioPadrao: number;
  intervaloInferior?: number;
  intervaloSuperior?: number;
  media3Rodadas?: number;
  media5Rodadas?: number;
  ehMandante?: boolean;
  forcaAdversario?: number;
  probSofrerGol?: number;
  probFazerGol?: number;
  modeloVersao: string;
  createdAt: string;
}

export interface TimeRecomendado {
  id: string;
  userId: string;
  rodadaId: string;
  nome: string;
  esquema: string;
  orcamento: number;
  custoTotal: number;
  pontosPrevistos: number;
  pontosReais?: number;
  estrategia: Estrategia;
  jogadores: TimeJogador[];
  createdAt: string;
}

export type Estrategia = 'SEGURO' | 'EQUILIBRADO' | 'OUSADO';

export const ESTRATEGIA_LABELS: Record<Estrategia, string> = {
  SEGURO: 'Time Seguro',
  EQUILIBRADO: 'Time Equilibrado',
  OUSADO: 'Time Ousado',
};

export interface TimeJogador {
  id: string;
  timeId: string;
  jogador: Jogador;
  posicaoTime: PosicaoTime;
  ordem: number;
  precoNaHora: number;
  pontosPrevistos: number;
}

export type PosicaoTime = 'TITULAR' | 'BANCO' | 'CAPITAO';

export interface ConfiguracaoTime {
  orcamento: number;
  esquema: string;
  estrategia: Estrategia;
  evitarClubes: string[];
  priorizarConsistencia: boolean;
  priorizarPotencial: boolean;
}

export interface MetricasModelo {
  mae: number;
  rmse: number;
  ndcg?: number;
  maePorPosicao: Record<Posicao, number>;
  acuraciaTop10: number;
  acuraciaTop50: number;
}

export interface DashboardStats {
  totalJogadores: number;
  totalRodadas: number;
  rodadaAtual?: Rodada;
  mediaAcuracia: number;
  timesGerados: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface GerarTimeFormData {
  orcamento: number;
  esquema: string;
  estrategia: Estrategia;
  evitarClubes: string[];
  priorizarConsistencia: boolean;
  priorizarPotencial: boolean;
}

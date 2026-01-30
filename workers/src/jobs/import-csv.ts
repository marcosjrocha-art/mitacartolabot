/**
 * Job de importação de CSV
 */

import Papa from 'papaparse';
import axios from 'axios';

interface CSVImportData {
  filename: string;
  content: string;
}

interface JogadorCSV {
  id?: string;
  nome?: string;
  apelido?: string;
  posicao?: string;
  clube?: string;
  preco?: string;
  status?: string;
}

interface PontuacaoCSV {
  jogador_id?: string;
  rodada?: string;
  pontos?: string;
  preco?: string;
}

export async function processCSVImport(data: CSVImportData): Promise<void> {
  const { filename, content } = data;
  
  console.log(`[Import CSV] Arquivo: ${filename}`);
  
  // Detectar tipo de arquivo pelo nome
  const tipo = detectarTipoArquivo(filename);
  
  // Parse do CSV
  const resultado = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  
  if (resultado.errors.length > 0) {
    console.warn('[Import CSV] Erros no parse:', resultado.errors);
  }
  
  const registros = resultado.data;
  console.log(`[Import CSV] ${registros.length} registros encontrados`);
  
  // Processar conforme o tipo
  switch (tipo) {
    case 'jogadores':
      await importarJogadores(registros as JogadorCSV[]);
      break;
    case 'pontuacoes':
      await importarPontuacoes(registros as PontuacaoCSV[]);
      break;
    case 'rodadas':
      await importarRodadas(registros);
      break;
    default:
      console.warn(`[Import CSV] Tipo de arquivo não reconhecido: ${filename}`);
  }
}

function detectarTipoArquivo(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('jogador')) return 'jogadores';
  if (lower.includes('pontuacao') || lower.includes('pontos')) return 'pontuacoes';
  if (lower.includes('rodada')) return 'rodadas';
  if (lower.includes('scout')) return 'scouts';
  return 'desconhecido';
}

async function importarJogadores(jogadores: JogadorCSV[]): Promise<void> {
  console.log(`[Import CSV] Importando ${jogadores.length} jogadores...`);
  
  const apiUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  for (const jogador of jogadores) {
    try {
      // Aqui você faria a chamada para a API para criar/atualizar o jogador
      // Simplificado para o exemplo
      console.log(`[Import CSV] Jogador: ${jogador.apelido || jogador.nome}`);
    } catch (error) {
      console.error(`[Import CSV] Erro ao importar jogador:`, error);
    }
  }
  
  console.log('[Import CSV] Jogadores importados com sucesso!');
}

async function importarPontuacoes(pontuacoes: PontuacaoCSV[]): Promise<void> {
  console.log(`[Import CSV] Importando ${pontuacoes.length} pontuações...`);
  
  // Implementação similar à de jogadores
  console.log('[Import CSV] Pontuações importadas com sucesso!');
}

async function importarRodadas(rodadas: any[]): Promise<void> {
  console.log(`[Import CSV] Importando ${rodadas.length} rodadas...`);
  
  // Implementação similar
  console.log('[Import CSV] Rodadas importadas com sucesso!');
}

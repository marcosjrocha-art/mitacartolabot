/**
 * Seed do banco de dados com dados iniciais
 */

import { PrismaClient, Posicao, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Clubes do Brasileirão 2024
const clubes = [
  { nome: 'América-MG', abreviacao: 'AME', cores: ['#00A650', '#000000'] },
  { nome: 'Athletico-PR', abreviacao: 'CAP', cores: ['#E30613', '#000000'] },
  { nome: 'Atlético-MG', abreviacao: 'CAM', cores: ['#000000', '#FFFFFF'] },
  { nome: 'Bahia', abreviacao: 'BAH', cores: ['#0066CC', '#FF0000', '#FFFFFF'] },
  { nome: 'Botafogo', abreviacao: 'BOT', cores: ['#000000', '#FFFFFF'] },
  { nome: 'Bragantino', abreviacao: 'RBB', cores: ['#FFFFFF', '#000000'] },
  { nome: 'Corinthians', abreviacao: 'COR', cores: ['#000000', '#FFFFFF'] },
  { nome: 'Coritiba', abreviacao: 'CFC', cores: ['#008B45', '#FFFFFF'] },
  { nome: 'Cruzeiro', abreviacao: 'CRU', cores: ['#0066CC', '#FFFFFF'] },
  { nome: 'Cuiabá', abreviacao: 'CUI', cores: ['#008B45', '#FFD700'] },
  { nome: 'Flamengo', abreviacao: 'FLA', cores: ['#E30613', '#000000'] },
  { nome: 'Fluminense', abreviacao: 'FLU', cores: ['#0066CC', '#008B45', '#FFFFFF'] },
  { nome: 'Fortaleza', abreviacao: 'FOR', cores: ['#E30613', '#0000FF', '#FFFFFF'] },
  { nome: 'Goiás', abreviacao: 'GOI', cores: ['#008B45', '#FFFFFF'] },
  { nome: 'Grêmio', abreviacao: 'GRE', cores: ['#0066CC', '#000000', '#FFFFFF'] },
  { nome: 'Internacional', abreviacao: 'INT', cores: ['#E30613', '#FFFFFF'] },
  { nome: 'Palmeiras', abreviacao: 'PAL', cores: ['#00A650', '#FFFFFF'] },
  { nome: 'Santos', abreviacao: 'SAN', cores: ['#000000', '#FFFFFF'] },
  { nome: 'São Paulo', abreviacao: 'SAO', cores: ['#E30613', '#000000', '#FFFFFF'] },
  { nome: 'Vasco', abreviacao: 'VAS', cores: ['000000', '#FFFFFF'] },
];

// Jogadores mockados (exemplo simplificado)
const jogadoresMock = [
  // Goleiros
  { nome: 'Weverton', apelido: 'Weverton', posicao: 'GOLEIRO', preco: 15.0, mediaPontos: 5.2 },
  { nome: 'Everson', apelido: 'Everson', posicao: 'GOLEIRO', preco: 12.0, mediaPontos: 4.8 },
  { nome: 'Lucas Perri', apelido: 'Lucas Perri', posicao: 'GOLEIRO', preco: 8.0, mediaPontos: 3.5 },
  
  // Zagueiros
  { nome: 'Gustavo Gómez', apelido: 'G. Gómez', posicao: 'ZAGUEIRO', preco: 12.0, mediaPontos: 5.5 },
  { nome: 'Murilo', apelido: 'Murilo', posicao: 'ZAGUEIRO', preco: 10.0, mediaPontos: 4.8 },
  { nome: 'Léo Pereira', apelido: 'Léo Pereira', posicao: 'ZAGUEIRO', preco: 8.0, mediaPontos: 4.2 },
  
  // Laterais
  { nome: 'Marcos Rocha', apelido: 'Marcos Rocha', posicao: 'LATERAL', preco: 10.0, mediaPontos: 5.0 },
  { nome: 'Piquerez', apelido: 'Piquerez', posicao: 'LATERAL', preco: 12.0, mediaPontos: 5.8 },
  { nome: 'Guilherme Arana', apelido: 'Arana', posicao: 'LATERAL', preco: 14.0, mediaPontos: 6.2 },
  
  // Meias
  { nome: 'Raphael Veiga', apelido: 'Raphael Veiga', posicao: 'MEIA', preco: 18.0, mediaPontos: 7.5 },
  { nome: 'Gerson', apelido: 'Gerson', posicao: 'MEIA', preco: 15.0, mediaPontos: 6.8 },
  { nome: 'Andreas Pereira', apelido: 'Andreas', posicao: 'MEIA', preco: 12.0, mediaPontos: 5.5 },
  { nome: 'Arrascaeta', apelido: 'Arrascaeta', posicao: 'MEIA', preco: 16.0, mediaPontos: 7.2 },
  
  // Atacantes
  { nome: 'Pedro', apelido: 'Pedro', posicao: 'ATACANTE', preco: 16.0, mediaPontos: 7.8 },
  { nome: 'Gabigol', apelido: 'Gabigol', posicao: 'ATACANTE', preco: 18.0, mediaPontos: 8.2 },
  { nome: 'Endrick', apelido: 'Endrick', posicao: 'ATACANTE', preco: 14.0, mediaPontos: 6.5 },
  { nome: 'Luis Suárez', apelido: 'Suárez', posicao: 'ATACANTE', preco: 20.0, mediaPontos: 9.0 },
  
  // Técnicos
  { nome: 'Abel Ferreira', apelido: 'Abel Ferreira', posicao: 'TECNICO', preco: 15.0, mediaPontos: 6.5 },
  { nome: 'Jorge Sampaoli', apelido: 'Sampaoli', posicao: 'TECNICO', preco: 12.0, mediaPontos: 5.8 },
  { nome: 'Renato Gaúcho', apelido: 'Renato', posicao: 'TECNICO', preco: 10.0, mediaPontos: 5.2 },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Criar usuário admin
  console.log('Criando usuário admin...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mitabot.com' },
    update: {},
    create: {
      email: 'admin@mitabot.com',
      name: 'Administrador',
      password: adminPassword,
      isAdmin: true,
    },
  });
  console.log(`✅ Usuário admin criado: ${admin.email}`);

  // Criar preferências do admin
  await prisma.userPreferencias.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      esquemaPadrao: '4-3-3',
      orcamentoPadrao: 100,
    },
  });

  // Criar clubes
  console.log('\nCriando clubes...');
  const clubesCriados = [];
  for (const clubeData of clubes) {
    const clube = await prisma.clube.upsert({
      where: { abreviacao: clubeData.abreviacao },
      update: {},
      create: {
        nome: clubeData.nome,
        abreviacao: clubeData.abreviacao,
        cores: clubeData.cores,
        eloOfensivo: 1500 + Math.random() * 200 - 100,
        eloDefensivo: 1500 + Math.random() * 200 - 100,
        eloGeral: 1500 + Math.random() * 200 - 100,
      },
    });
    clubesCriados.push(clube);
    console.log(`  ✅ ${clube.nome}`);
  }

  // Criar rodadas
  console.log('\nCriando rodadas...');
  for (let i = 1; i <= 38; i++) {
    const inicio = new Date(2024, 3, i * 7); // A partir de abril/2024
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);

    await prisma.rodada.upsert({
      where: { numero: i },
      update: {},
      create: {
        numero: i,
        inicio,
        fim,
        status: i === 1 ? 'ABERTA' : 'AGUARDANDO',
      },
    });
  }
  console.log('  ✅ 38 rodadas criadas');

  // Criar jogadores
  console.log('\nCriando jogadores...');
  let jogadorIndex = 0;
  for (const jogadorData of jogadoresMock) {
    // Distribuir jogadores entre clubes
    const clube = clubesCriados[jogadorIndex % clubesCriados.length];
    
    await prisma.jogador.upsert({
      where: { 
        id: `jogador_${jogadorIndex}` 
      },
      update: {},
      create: {
        id: `jogador_${jogadorIndex}`,
        nome: jogadorData.nome,
        apelido: jogadorData.apelido,
        posicao: jogadorData.posicao as Posicao,
        clubeId: clube.id,
        preco: jogadorData.preco,
        mediaPontos: jogadorData.mediaPontos,
        jogos: Math.floor(Math.random() * 20) + 5,
        status: 'PROVAVEL',
      },
    });
    
    jogadorIndex++;
  }
  console.log(`  ✅ ${jogadoresMock.length} jogadores criados`);

  // Criar configurações
  console.log('\nCriando configurações...');
  await prisma.configuracao.upsert({
    where: { chave: 'modelo_versao' },
    update: {},
    create: {
      chave: 'modelo_versao',
      valor: '1.0.0',
      descricao: 'Versão atual do modelo ML',
    },
  });

  console.log('\n✨ Seed concluído com sucesso!');
  console.log('\nCredenciais de acesso:');
  console.log('  Email: admin@mitabot.com');
  console.log('  Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

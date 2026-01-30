#!/bin/bash

# Script de Setup Inicial - MitaBot Cartola
# Prepara o projeto para deploy

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🚀 MitaBot Cartola - Setup Inicial               ║"
echo "║     Sistema de ML para recomendação de times              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    echo "   cd /mnt/okcomputer/output/mita-bot-cartola"
    exit 1
fi

echo -e "${YELLOW}📋 Etapas do setup:${NC}"
echo ""

# 1. Verificar dependências
echo -e "${BLUE}1️⃣ Verificando dependências...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado${NC}"
    echo "   Instale o Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não encontrado${NC}"
    echo "   Instale o Docker Compose"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não encontrado${NC}"
    echo "   Instale o Git"
    exit 1
fi

echo -e "${GREEN}✅ Todas as dependências estão instaladas${NC}"
echo ""

# 2. Configurar variáveis de ambiente
echo -e "${BLUE}2️⃣ Configurando variáveis de ambiente...${NC}"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado a partir de .env.example${NC}"
    echo -e "${YELLOW}⚠️  Edite o arquivo .env se necessário${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi
echo ""

# 3. Iniciar serviços
echo -e "${BLUE}3️⃣ Iniciando serviços com Docker Compose...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Serviços iniciados${NC}"
echo ""

# 4. Aguardar serviços ficarem prontos
echo -e "${BLUE}4️⃣ Aguardando serviços ficarem prontos...${NC}"
echo "   ⏳ Isso pode levar alguns segundos..."
sleep 15

# Verificar se PostgreSQL está pronto
echo "   Verificando PostgreSQL..."
until docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
    echo "   ⏳ Aguardando PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}   ✅ PostgreSQL pronto${NC}"

# Verificar se Redis está pronto
echo "   Verificando Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   ⏳ Aguardando Redis..."
    sleep 2
done
echo -e "${GREEN}   ✅ Redis pronto${NC}"
echo ""

# 5. Executar migrations
echo -e "${BLUE}5️⃣ Executando migrations do Prisma...${NC}"
docker-compose exec -T frontend npx prisma migrate dev --name init
echo -e "${GREEN}✅ Migrations executadas${NC}"
echo ""

# 6. Seed de dados
echo -e "${BLUE}6️⃣ Populando banco de dados...${NC}"
docker-compose exec -T frontend npx prisma db seed
echo -e "${GREEN}✅ Dados iniciais inseridos${NC}"
echo ""

# 7. Status final
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ Setup Concluído!                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}🌐 Acesse sua aplicação:${NC}"
echo "   • Frontend:    http://localhost:3000"
echo "   • ML API Docs: http://localhost:8000/docs"
echo ""
echo -e "${BLUE}🔑 Credenciais de acesso:${NC}"
echo "   • Email: admin@mitabot.com"
echo "   • Senha: admin123"
echo ""
echo -e "${BLUE}📚 Próximos passos:${NC}"
echo "   1. Acesse http://localhost:3000"
echo "   2. Faça login com as credenciais acima"
echo "   3. Vá para 'Gerar Time' e teste o sistema"
echo "   4. Para deploy no Render, veja CHECKLIST.md"
echo ""
echo -e "${BLUE}🛠️ Comandos úteis:${NC}"
echo "   • Ver logs:     docker-compose logs -f"
echo "   • Parar:        docker-compose down"
echo "   • Reiniciar:    docker-compose restart"
echo ""
echo -e "${YELLOW}💡 Dica: Para deploy no Render, suba para o GitHub primeiro!${NC}"
echo ""
echo -e "${GREEN}🎉 Bom uso do MitaBot Cartola!${NC}"

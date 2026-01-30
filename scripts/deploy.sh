#!/bin/bash

# Script de Deploy - MitaBot Cartola
# Uso: ./scripts/deploy.sh [render|railway|vps|local]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 MitaBot Cartola - Deploy Script${NC}"
echo ""

# Verificar argumentos
PLATFORM=${1:-""}

if [ -z "$PLATFORM" ]; then
    echo "Uso: ./scripts/deploy.sh [render|railway|vps|local]"
    echo ""
    echo "Opções:"
    echo "  render  - Deploy no Render.com (free tier disponível)"
    echo "  railway - Deploy no Railway.app (free tier disponível)"
    echo "  vps     - Deploy em VPS próprio (DigitalOcean, AWS, etc)"
    echo "  local   - Deploy local com Docker"
    echo ""
    exit 1
fi

case $PLATFORM in
    render)
        echo -e "${YELLOW}📦 Deploy no Render${NC}"
        echo ""
        
        # Verificar se render.yaml existe
        if [ ! -f "render.yaml" ]; then
            echo -e "${RED}❌ render.yaml não encontrado${NC}"
            exit 1
        fi
        
        echo "1. Certifique-se de ter uma conta em https://render.com"
        echo "2. Conecte seu repositório GitHub"
        echo "3. O Render detectará automaticamente o render.yaml"
        echo ""
        echo -e "${GREEN}✅ Arquivo render.yaml configurado!${NC}"
        echo ""
        echo "Próximos passos:"
        echo "  1. git add ."
        echo "  2. git commit -m 'Ready for deploy'"
        echo "  3. git push origin main"
        echo "  4. Acesse https://dashboard.render.com e crie um Blueprint"
        echo ""
        ;;
        
    railway)
        echo -e "${YELLOW}📦 Deploy no Railway${NC}"
        echo ""
        
        # Verificar Railway CLI
        if ! command -v railway &> /dev/null; then
            echo "Instalando Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "Fazendo login no Railway..."
        railway login
        
        echo "Inicializando projeto..."
        railway init
        
        echo "Adicionando PostgreSQL..."
        railway add --database postgres
        
        echo "Adicionando Redis..."
        railway add --database redis
        
        echo "Fazendo deploy..."
        railway up
        
        echo -e "${GREEN}✅ Deploy no Railway concluído!${NC}"
        echo "URL: $(railway domain)"
        ;;
        
    vps)
        echo -e "${YELLOW}📦 Deploy em VPS${NC}"
        echo ""
        
        # Verificar se é um servidor remoto ou local
        read -p "É deploy local (este servidor)? (s/n): " LOCAL
        
        if [ "$LOCAL" = "s" ] || [ "$LOCAL" = "S" ]; then
            echo "Deploy local..."
            
            # Verificar Docker
            if ! command -v docker &> /dev/null; then
                echo -e "${RED}❌ Docker não encontrado${NC}"
                echo "Instale o Docker primeiro:"
                echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
                echo "  sudo sh get-docker.sh"
                exit 1
            fi
            
            if ! command -v docker-compose &> /dev/null; then
                echo -e "${RED}❌ Docker Compose não encontrado${NC}"
                echo "Instale o Docker Compose"
                exit 1
            fi
            
            echo "Iniciando serviços..."
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            
            echo "Aguardando serviços..."
            sleep 10
            
            echo "Executando migrations..."
            docker-compose exec -T frontend npx prisma migrate deploy
            
            echo "Executando seed..."
            docker-compose exec -T frontend npx prisma db seed
            
            echo ""
            echo -e "${GREEN}✅ Deploy local concluído!${NC}"
            echo ""
            echo "Acesse:"
            echo "  Frontend: http://localhost:3000"
            echo "  ML API:   http://localhost:8000/docs"
            echo ""
            echo "Credenciais:"
            echo "  Email: admin@mitabot.com"
            echo "  Senha: admin123"
            
        else
            echo "Deploy remoto em VPS..."
            echo ""
            
            read -p "IP do servidor: " SERVER_IP
            read -p "Usuário SSH: " SSH_USER
            
            echo ""
            echo "Comandos para executar no servidor:"
            echo ""
            echo "  1. ssh ${SSH_USER}@${SERVER_IP}"
            echo "  2. git clone https://github.com/SEU_USUARIO/mitabot-cartola.git"
            echo "  3. cd mitabot-cartola"
            echo "  4. cp .env.example .env"
            echo "  5. # Edite .env com suas configurações"
            echo "  6. docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
            echo "  7. docker-compose exec frontend npx prisma migrate deploy"
            echo "  8. docker-compose exec frontend npx prisma db seed"
            echo ""
        fi
        ;;
        
    local)
        echo -e "${YELLOW}📦 Deploy Local (Desenvolvimento)${NC}"
        echo ""
        
        # Verificar Docker
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker não encontrado${NC}"
            exit 1
        fi
        
        echo "Iniciando serviços com Docker Compose..."
        docker-compose up -d
        
        echo ""
        echo -e "${GREEN}✅ Serviços iniciados!${NC}"
        echo ""
        echo "Acesse:"
        echo "  Frontend: http://localhost:3000"
        echo "  ML API:   http://localhost:8000/docs"
        echo ""
        echo "Para ver logs: docker-compose logs -f"
        echo "Para parar:    docker-compose down"
        ;;
        
    *)
        echo -e "${RED}❌ Plataforma não reconhecida: $PLATFORM${NC}"
        echo "Use: render, railway, vps ou local"
        exit 1
        ;;
esac

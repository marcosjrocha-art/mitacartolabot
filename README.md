# MitaBot Cartola

Sistema inteligente de recomendação de times para o Cartola FC usando Machine Learning.

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Next.js API   │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (Route        │     │   (Prisma)      │
│                 │◄────│   Handlers)     │◄────│                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
           ┌─────────────────┐      ┌─────────────────┐
           │  ML Service     │      │  Redis/BullMQ   │
           │  (Python/FastAPI)│     │  (Workers)      │
           │                 │      │                 │
           │  • Predição     │      │  • Ingestão     │
           │  • Otimização   │      │  • Treino       │
           │  • Treinamento  │      │  • Jobs         │
           └─────────────────┘      └─────────────────┘
```

## Stack Tecnológica

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Route Handlers (API)
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Cache/Filas**: Redis + BullMQ
- **Machine Learning**: Python, FastAPI, XGBoost, scikit-learn, PuLP
- **Deploy**: Docker Compose (dev), Docker + Cloud (prod)

## Decisões de Arquitetura

### Por que Next.js Route Handlers em vez de FastAPI separado?

Para o MVP, escolhi Next.js Route Handlers porque:
1. **Menor complexidade**: Um único codebase para frontend e API
2. **Type safety**: Compartilhamento de tipos TypeScript entre frontend e backend
3. **Deploy simplificado**: Vercel/Render com um único serviço
4. **Escalabilidade futura**: Fácil extrair para FastAPI quando necessário

O microserviço Python de ML é separado porque:
1. **Ecossistema Python**: Bibliotecas de ML maduras (scikit-learn, XGBoost)
2. **Isolamento**: Treinamento pesado não afeta a API principal
3. **Escalabilidade independente**: Pode escalar workers de ML separadamente

### Pipeline de ML

1. **Ingestão**: Dados de jogadores, partidas e scouts → PostgreSQL
2. **Feature Engineering**: Médias móveis, Elo dos times, probabilidades
3. **Treinamento**: XGBoost com validação temporal (evita data leakage)
4. **Predição**: Pontos esperados por jogador
5. **Otimização**: ILP (PuLP) para montar time ótimo respeitando restrições
6. **Feedback**: Após rodada, comparar previsão vs real e re-treinar

### Otimização da Escalação

Problema de otimização com restrições:
- Orçamento (C$)
- Formação tática (4-3-3, 4-4-2, etc.)
- Máximo de jogadores por clube
- Posições obrigatórias

Resolvido com PuLP (Integer Linear Programming) para garantir otimalidade.

## Como Rodar

### Desenvolvimento (Docker Compose)

```bash
# 1. Clone o repositório
cd mita-bot-cartola

# 2. Copie as variáveis de ambiente
cp .env.example .env

# 3. Inicie todos os serviços
docker-compose up -d

# 4. Acesse
# Frontend: http://localhost:3000
# ML API: http://localhost:8000/docs
```

### Modo MVP (dados mockados)

O sistema já vem com dados de exemplo. Após iniciar:

1. Acesse http://localhost:3000
2. Faça login com: admin@mitabot.com / admin123
3. Vá para "Admin" → "Importar CSV" para carregar dados de jogadores
4. Ou use os dados mockados já carregados

### Fluxo de Operação por Rodada

```
1. Importar dados da rodada (CSV ou API)
   └── Admin → Importar Dados → Upload CSV

2. Gerar previsões
   └── ML Service calcula pontos esperados

3. Montar time recomendado
   └── Usuário informa orçamento e esquema
   └── Sistema retorna time ótimo + alternativas

4. Após a rodada (resultados reais)
   └── Admin → Importar Resultados
   └── Sistema calcula acurácia
   └── Modelo é re-treinado com novos dados
```

## Estrutura de Pastas

```
mita-bot-cartola/
├── frontend/           # Next.js 14+ App Router
│   ├── src/
│   │   ├── app/        # Rotas (App Router)
│   │   ├── components/ # Componentes React
│   │   ├── lib/        # Utilitários
│   │   └── hooks/      # Custom hooks
│   └── prisma/         # Schema e migrations
├── ml-service/         # Microserviço Python
│   └── src/
│       ├── models/     # Modelos treinados
│       ├── training/   # Pipeline de treino
│       └── api/        # FastAPI routes
├── workers/            # BullMQ workers
│   └── src/
│       └── jobs/       # Definições de jobs
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

### Jogadores
- `GET /api/jogadores` - Listar jogadores
- `GET /api/jogadores/:id` - Detalhes do jogador
- `GET /api/jogadores/:id/historico` - Histórico de pontuação

### Times
- `POST /api/times/recomendar` - Gerar time recomendado
- `GET /api/times/:id` - Ver time salvo
- `POST /api/times/:id/salvar` - Salvar time

### Previsões
- `GET /api/previsoes/rodada/:rodadaId` - Previsões por rodada
- `GET /api/previsoes/jogador/:jogadorId` - Previsões por jogador

### Admin
- `POST /api/admin/importar/csv` - Importar CSV
- `POST /api/admin/rodadas/:id/processar` - Processar rodada
- `GET /api/admin/jobs` - Status dos jobs
- `POST /api/admin/modelos/treinar` - Disparar treinamento

### ML Service
- `POST /ml/predict` - Predizer pontos
- `POST /ml/optimize` - Otimizar escalação
- `POST /ml/train` - Treinar modelo
- `GET /ml/metrics` - Métricas do modelo

## Modelo de Dados

Veja `frontend/prisma/schema.prisma` para o schema completo.

Principais entidades:
- **Rodada**: Informações da rodada do Campeonato Brasileiro
- **Clube**: Times do Brasileirão
- **Jogador**: Atletas com posição, clube, preço
- **Scout**: Estatísticas por jogo (finalizações, roubadas, etc.)
- **Pontuacao**: Pontos reais por jogador por rodada
- **Previsao**: Pontos previstos pelo modelo
- **TimeRecomendado**: Times gerados pelo sistema

## Testes

```bash
# Frontend
cd frontend && npm test

# ML Service
cd ml-service && pytest

# Workers
cd workers && npm test
```

## 🚀 Deploy

Veja o guia completo em [DEPLOY.md](./DEPLOY.md)

### Opção Rápida: Render (Free Tier)

```bash
# 1. Suba para GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU_USUARIO/mitabot-cartola.git
git push -u origin main

# 2. No Render Dashboard:
#    - Blueprints → New Blueprint Instance
#    - Conecte seu repo GitHub
#    - O render.yaml será detectado automaticamente
```

### Opção 2: Script de Deploy Automatizado

```bash
# Deploy local com Docker
./scripts/deploy.sh local

# Deploy em VPS
./scripts/deploy.sh vps
```

### Opção 3: VPS Próprio (DigitalOcean, AWS, Hetzner)

```bash
# No seu servidor
ssh usuario@seu-servidor
git clone https://github.com/SEU_USUARIO/mitabot-cartola.git
cd mita-bot-cartola
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Custos Estimados

| Plataforma | Custo Mensal | Observação |
|------------|-------------|------------|
| Render Free | $0 | Sleep após 15min inativo |
| Render Starter | ~$25 | Sem sleep |
| Railway | $5-20 | Baseado em uso |
| DigitalOcean | $12 | Droplet 2GB |
| Hetzner | ~$7 | CX21 (Alemanha) |

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT

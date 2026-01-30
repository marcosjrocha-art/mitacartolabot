# MitaBot Cartola - Guia de Setup

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        MitaBot Cartola                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Workers    │  │   ML Service │          │
│  │   Next.js    │  │   BullMQ     │  │   Python     │          │
│  │   Port 3000  │  │   (Redis)    │  │   Port 8000  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                    ┌──────┴──────┐                             │
│                    │    Redis    │                             │
│                    │   Port 6379 │                             │
│                    └──────┬──────┘                             │
│                           │                                     │
│                    ┌──────┴──────┐                             │
│                    │  PostgreSQL │                             │
│                    │   Port 5432 │                             │
│                    └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
1. IMPORTAÇÃO
   CSV → API → Queue → Worker → PostgreSQL

2. TREINAMENTO
   Admin → API → Queue → Worker → ML Service → Modelo

3. PREDIÇÃO
   ML Service → PostgreSQL (previsões)

4. OTIMIZAÇÃO
   Frontend → API → ML Service → Time Ótimo

5. FEEDBACK
   Resultados Reais → Treinamento Incremental
```

## Como Executar

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Clone o repositório
cd mita-bot-cartola

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env conforme necessário

# 3. Inicie todos os serviços
docker-compose up -d

# 4. Execute as migrations e seed
docker-compose exec frontend npx prisma migrate dev
docker-compose exec frontend npx prisma db seed

# 5. Acesse a aplicação
# Frontend: http://localhost:3000
# ML API Docs: http://localhost:8000/docs
```

### Opção 2: Desenvolvimento Local

#### Pré-requisitos
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

#### 1. Banco de Dados
```bash
# Inicie PostgreSQL e Redis
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
docker run -d --name redis -p 6379:6379 redis:7
```

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install
cp .env.example .env
# Edite DATABASE_URL e REDIS_URL
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

#### 3. ML Service (Python)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

#### 4. Workers (Node.js)
```bash
cd workers
npm install
npm run dev
```

## Fluxo de Operação por Rodada

### 1. Importar Dados da Rodada

```bash
# Via Admin UI
1. Acesse http://localhost:3000/admin
2. Vá para "Importar Dados"
3. Faça upload do CSV com dados dos jogadores

# Ou via API
curl -X POST http://localhost:3000/api/admin/importar/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@jogadores_rodada_1.csv"
```

### 2. Treinar o Modelo

```bash
# Via Admin UI
1. Acesse http://localhost:3000/admin
2. Vá para "Modelos"
3. Clique em "Iniciar Treinamento"

# Ou via API
curl -X POST http://localhost:3000/api/admin/modelos/treinar \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Gerar Previsões

```bash
# Automático após treinamento
# Ou via ML Service
curl -X POST "http://localhost:8000/batch-predict?rodada_id=$RODADA_ID"
```

### 4. Gerar Time Recomendado

```bash
# Via UI
1. Acesse http://localhost:3000/gerar-time
2. Configure orçamento, esquema e estratégia
3. Clique em "Gerar Time"

# Ou via API
curl -X POST http://localhost:3000/api/times/recomendar \
  -H "Content-Type: application/json" \
  -d '{
    "orcamento": 100,
    "esquema": "4-3-3",
    "estrategia": "EQUILIBRADO"
  }'
```

### 5. Importar Resultados e Retreinar

```bash
# Após a rodada terminar
1. Importe CSV com pontuações reais
2. O sistema calcula métricas automaticamente
3. Execute novo treinamento com dados atualizados
```

## Estrutura de CSVs

### jogadores.csv
```csv
id,nome,apelido,posicao,clube_id,preco,status
1,Weverton Pereira,Weverton,GOLEIRO,1,15.0,PROVAVEL
2,Gustavo Gómez,G. Gomez,ZAGUEIRO,1,12.0,PROVAVEL
...
```

### pontuacoes.csv
```csv
jogador_id,rodada,pontos,preco
1,1,8.5,15.0
2,1,6.2,12.0
...
```

### rodadas.csv
```csv
numero,inicio,fim,status
1,2024-04-13,2024-04-14,ENCERRADA
2,2024-04-20,2024-04-21,ABERTA
...
```

## Variáveis de Ambiente

### Frontend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mitabot
REDIS_URL=redis://localhost:6379
JWT_SECRET=seu-jwt-secret-aqui
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### ML Service (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mitabot
MODEL_PATH=/app/models
```

### Workers (.env)
```env
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:8000
```

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f frontend
docker-compose logs -f ml-service
docker-compose logs -f workers

# Resetar banco
docker-compose exec frontend npx prisma migrate reset

# Acessar banco
docker-compose exec db psql -U postgres -d mitabot

# Acessar Redis
docker-compose exec redis redis-cli

# Rebuild após mudanças
docker-compose up -d --build
```

## Troubleshooting

### Erro: "Modelo não está treinado"
- Execute o treinamento via Admin UI ou API
- Verifique logs do ML Service

### Erro: "Conexão recusada" ao ML Service
- Verifique se o ML Service está rodando: `docker-compose ps`
- Verifique ML_SERVICE_URL no frontend

### Erro: "Migration failed"
- Resetar banco: `npx prisma migrate reset`
- Ou recriar containers: `docker-compose down -v && docker-compose up -d`

### Workers não processam jobs
- Verifique conexão com Redis
- Reinicie workers: `docker-compose restart workers`

## Deploy

### Render/Railway
1. Crie um novo Web Service apontando para `./frontend`
2. Adicione PostgreSQL e Redis como addons
3. Configure variáveis de ambiente
4. Deploy!

### Vercel (Frontend apenas)
```bash
cd frontend
vercel --prod
```

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

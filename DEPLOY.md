# 🚀 Guia de Deploy - MitaBot Cartola

## Opção 1: Render (Recomendado para iniciantes)

### Passo a passo:

1. **Crie uma conta no Render**
   - Acesse https://render.com
   - Faça login com GitHub

2. **Fork o repositório no GitHub**
   ```bash
   # Suba o código para um repositório GitHub
   cd mita-bot-cartola
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/SEU_USUARIO/mitabot-cartola.git
   git push -u origin main
   ```

3. **Deploy via Blueprint**
   - No Render Dashboard, clique em "Blueprints"
   - Clique "New Blueprint Instance"
   - Conecte seu repositório GitHub
   - O Render detectará automaticamente o `render.yaml`
   - Clique "Apply"

4. **Aguarde o deploy**
   - PostgreSQL: ~2 minutos
   - Redis: ~1 minuto
   - Frontend: ~5 minutos
   - ML Service: ~3 minutos
   - Workers: ~2 minutos

5. **Execute as migrations**
   - No Render Dashboard, vá em "Shell" do serviço frontend
   - Execute: `npx prisma migrate deploy`
   - Execute: `npx prisma db seed`

6. **Acesse sua aplicação**
   - URL será algo como: `https://mitabot-frontend.onrender.com`

---

## Opção 2: Railway

### Passo a passo:

1. **Crie uma conta no Railway**
   - Acesse https://railway.app
   - Faça login com GitHub

2. **Novo projeto**
   - Clique "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

3. **Adicione serviços**
   - Clique "New" → "Database" → "Add PostgreSQL"
   - Clique "New" → "Database" → "Add Redis"

4. **Configure variáveis de ambiente**
   - Vá em cada serviço e adicione as env vars necessárias

5. **Deploy**
   - O Railway faz deploy automático a cada push

---

## Opção 3: VPS (DigitalOcean, AWS, Hetzner)

### Requisitos:
- Servidor com Docker e Docker Compose instalados
- 2GB RAM mínimo (recomendado 4GB)
- 20GB disco

### Passo a passo:

1. **Crie um servidor** (ex: DigitalOcean Droplet $12/mês)

2. **Instale Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Clone o repositório**
   ```bash
   git clone https://github.com/SEU_USUARIO/mitabot-cartola.git
   cd mita-bot-cartola
   ```

4. **Configure o ambiente**
   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   nano .env
   ```

5. **Inicie os serviços**
   ```bash
   docker-compose up -d
   ```

6. **Execute migrations**
   ```bash
   docker-compose exec frontend npx prisma migrate deploy
   docker-compose exec frontend npx prisma db seed
   ```

7. **Configure Nginx (opcional, para HTTPS)**
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   # Configure seu domínio
   sudo certbot --nginx -d seu-dominio.com
   ```

---

## Opção 4: Vercel (Frontend apenas)

Se quiser separar o frontend:

1. **Prepare o frontend**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure variáveis de ambiente no Vercel**
   - `DATABASE_URL` (PostgreSQL externo)
   - `REDIS_URL` (Redis externo)
   - `JWT_SECRET`
   - `ML_SERVICE_URL`

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

---

## 📋 Checklist Pré-Deploy

- [ ] Criou conta na plataforma escolhida
- [ ] Subiu código para GitHub
- [ ] Configurou variáveis de ambiente
- [ ] PostgreSQL criado e acessível
- [ ] Redis criado e acessível
- [ ] Executou migrations
- [ ] Executou seed de dados
- [ ] Testou login (admin@mitabot.com / admin123)
- [ ] Testou geração de time
- [ ] Verificou métricas do modelo

---

## 🔧 Troubleshooting Deploy

### Erro: "Cannot find module"
- Verifique se `npm install` foi executado
- Verifique se `npx prisma generate` foi executado

### Erro: "Database connection failed"
- Verifique DATABASE_URL
- Verifique se IP está na allowlist do banco
- Teste conexão: `psql $DATABASE_URL`

### Erro: "Redis connection failed"
- Verifique REDIS_URL
- Verifique se Redis está rodando

### Erro: "Modelo não treinado"
- Acesse /admin e execute treinamento
- Verifique logs do ML Service

---

## 💰 Custos Estimados

| Plataforma | Configuração | Custo Mensal |
|------------|-------------|--------------|
| Render | Free tier (sleep) | $0 |
| Render | Starter (sem sleep) | ~$25 |
| Railway | Starter | ~$5-20 |
| DigitalOcean | 2GB RAM | $12 |
| AWS | t3.small | ~$15 |
| Hetzner | CX21 | €6 (~$7) |

---

## 🔄 CI/CD (GitHub Actions)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## 📞 Suporte

Se tiver problemas no deploy:
1. Verifique os logs no dashboard da plataforma
2. Teste localmente primeiro: `docker-compose up`
3. Verifique variáveis de ambiente
4. Confira se todas as portas estão corretas

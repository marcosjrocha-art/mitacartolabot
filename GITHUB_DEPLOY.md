# 🚀 Guia Rápido - GitHub + Render

## 📤 Subir para o GitHub

### Opção 1: Comandos Git

```bash
# 1. Entre na pasta do projeto
cd /mnt/okcomputer/output/mita-bot-cartola

# 2. Inicialize o Git
git init

# 3. Adicione todos os arquivos
git add .

# 4. Faça o commit
git commit -m "🚀 MitaBot Cartola - Initial commit"

# 5. Crie a branch main
git branch -M main

# 6. Conecte ao GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/mitabot-cartola.git

# 7. Envie para o GitHub
git push -u origin main
```

### Opção 2: Upload Manual

1. Acesse https://github.com/new
2. Nomeie: `mitabot-cartola`
3. Deixe público ou privado
4. **NÃO** inicialize com README (já temos um)
5. Clique "Create repository"
6. Siga as instruções na tela

---

## 🌐 Deploy no Render

### Passo 1: Criar Conta
1. Acesse https://render.com
2. Clique "Get Started for Free"
3. Faça login com sua conta **GitHub**

### Passo 2: Deploy Automático (Blueprint)

1. No Dashboard do Render, clique em **"Blueprints"**
2. Clique **"New Blueprint Instance"**
3. Selecione seu repositório `mitabot-cartola`
4. O Render detectará automaticamente o arquivo `render.yaml`
5. Clique **"Apply"**
6. Aguarde o deploy (pode levar 5-10 minutos)

### Passo 3: Configurar Banco de Dados

1. Após o deploy, clique no serviço **frontend**
2. Vá na aba **"Shell"**
3. Execute:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Passo 4: Acessar

- **Frontend**: `https://mitabot-frontend.onrender.com`
- **Login**: admin@mitabot.com
- **Senha**: admin123

---

## ⚡ Comandos Úteis

### Local (Desenvolvimento)

```bash
# Iniciar tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Resetar banco
docker-compose down -v
docker-compose up -d
docker-compose exec frontend npx prisma migrate deploy
docker-compose exec frontend npx prisma db seed
```

### Render (Produção)

```bash
# Acesse o Shell do serviço frontend no dashboard
# E execute:

# Ver status
npx prisma migrate status

# Resetar banco (cuidado!)
npx prisma migrate reset --force

# Ver logs de um serviço
docker-compose logs frontend
```

---

## 🔧 Troubleshooting

### "Build failed"
- Verifique os logs no Render Dashboard
- Geralmente é variável de ambiente faltando

### "Cannot connect to database"
- Aguarde o PostgreSQL ficar "Available"
- Verifique se `DATABASE_URL` está correta

### "Modelo não treinado"
- Acesse `/admin` no frontend
- Clique em "Treinar Modelo"
- Aguarde completar

---

## 📋 Checklist Pré-Deploy

- [ ] Código no GitHub
- [ ] Conta no Render criada
- [ ] Blueprint aplicado
- [ ] PostgreSQL "Available"
- [ ] Migrations executadas
- [ ] Seed de dados executado
- [ ] Conseguiu fazer login
- [ ] Conseguiu gerar um time

---

## 💰 Custos

| Plano | Custo | Recursos |
|-------|-------|----------|
| **Free** | $0 | Sleep após 15min |
| **Starter** | $7/mês | Sem sleep |

**Dica**: Para uso pessoal, o Free tier é suficiente. O sleep só afeta se ninguém acessar por 15 minutos.

---

## 🎉 Pronto!

Seu MitaBot Cartola está no ar! 🚀

# ✅ Checklist de Deploy - MitaBot Cartola

## Preparação (Local)

- [ ] Testou localmente com `docker-compose up`?
- [ ] Acessou http://localhost:3000 e funcionou?
- [ ] Fez login com admin@mitabot.com / admin123?
- [ ] Testou gerar um time?

## GitHub

- [ ] Criou repositório no GitHub?
- [ ] Executou os comandos abaixo?

```bash
cd /mnt/okcomputer/output/mita-bot-cartola
git init
git add .
git commit -m "🚀 Initial commit - MitaBot Cartola"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mitabot-cartola.git
git push -u origin main
```

## Render (Deploy)

### 1. Criar Conta
- [ ] Acessou https://render.com?
- [ ] Fez login com GitHub?

### 2. Deploy via Blueprint
- [ ] No Dashboard, clicou em "Blueprints"?
- [ ] Clicou em "New Blueprint Instance"?
- [ ] Selecionou o repositório `mitabot-cartola`?
- [ ] Clicou em "Apply"?

### 3. Aguardar Deploy
- [ ] PostgreSQL: Status "Available"?
- [ ] Redis: Status "Available"?
- [ ] Frontend: Build concluído?
- [ ] ML Service: Build concluído?
- [ ] Workers: Build concluído?

### 4. Configurar Banco de Dados
- [ ] Acessou "Shell" do serviço frontend?
- [ ] Executou: `npx prisma migrate deploy`?
- [ ] Executou: `npx prisma db seed`?

### 5. Testar Aplicação
- [ ] Acessou a URL do frontend?
- [ ] Fez login com as credenciais?
- [ ] Conseguiu gerar um time?

## Configurações Pós-Deploy

### Variáveis de Ambiente (se necessário)
- [ ] Verificou `JWT_SECRET` no frontend?
- [ ] Verificou `DATABASE_URL`?
- [ ] Verificou `REDIS_URL`?

### Primeiro Uso
- [ ] Acessou `/admin`?
- [ ] Importou dados de jogadores (CSV)?
- [ ] Executou treinamento do modelo?
- [ ] Gerou previsões para a rodada?

## URLs Após Deploy

| Serviço | URL |
|---------|-----|
| Frontend | `https://mitabot-frontend.onrender.com` |
| ML API | `https://mitabot-ml-service.onrender.com/docs` |

## Troubleshooting

### Erro: "Build failed"
```bash
# Verifique os logs no Render Dashboard
# Geralmente é problema de variável de ambiente
```

### Erro: "Database connection failed"
- Verifique se o PostgreSQL está "Available"
- Verifique se `DATABASE_URL` está correta

### Erro: "Modelo não treinado"
- Acesse `/admin`
- Clique em "Treinar Modelo"
- Aguarde o treinamento completar

## Comandos Úteis (Render Shell)

```bash
# Ver logs
docker-compose logs -f

# Restart serviço
docker-compose restart frontend

# Acessar banco
psql $DATABASE_URL

# Ver jobs na fila
redis-cli LRANGE bull:import-csv 0 -1
```

## 🎉 Sucesso!

Se tudo estiver ✅, seu MitaBot Cartola está no ar!

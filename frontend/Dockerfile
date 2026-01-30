FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache openssl

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar prisma schema
COPY prisma ./prisma/

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "dev"]

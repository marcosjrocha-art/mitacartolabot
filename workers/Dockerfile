FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src/ ./src/
COPY ../shared ./shared

# Comando padrão
CMD ["npm", "run", "start:workers"]

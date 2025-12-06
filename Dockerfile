# Multi-stage build para otimização
FROM node:18-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Stage para desenvolvimento e testes
FROM base AS dev
RUN npm ci && npm cache clean --force

# Stage para testes
FROM dev AS test
COPY . .
RUN npm run test:ci

# Stage para produção
FROM base AS production

# Instalar dependências apenas de produção
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar código da aplicação
COPY . .

# Alterar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta da aplicação
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    if (res.statusCode === 200) process.exit(0); else process.exit(1); \
  }).on('error', () => process.exit(1));"

# Comando para iniciar a aplicação
CMD ["npm", "start"]
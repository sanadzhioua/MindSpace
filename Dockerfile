# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copier package.json et installer dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Run app
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier build et node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exposer le port
EXPOSE 3000

# Lancer l’application
CMD ["npm", "start"]

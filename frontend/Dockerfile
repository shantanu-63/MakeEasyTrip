# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first
COPY frontend/package*.json ./
RUN npm ci

# Copy shared directory and frontend source
COPY shared /shared
COPY frontend ./

# Build Next.js app
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built app and config
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "start"]

# Multi-stage production build for ITAM Enterprise
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copy source files
COPY . .

# Build Vite frontend and bundled CommonJS server
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for container health check
RUN apk add --no-cache curl

# Install production dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled distribution from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Ensure data and upload directories exist
RUN mkdir -p /app/data /app/uploads

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.cjs"]

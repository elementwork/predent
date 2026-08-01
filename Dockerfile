# syntax=docker/dockerfile:1
FROM node:24-alpine AS base

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ gcc libc-dev

WORKDIR /app

# Copy dependency files and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install runtime dependencies for sqlite
RUN apk add --no-cache ca-certificates

# Copy built artifacts and dependencies from build stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
COPY --from=base /app/db ./db
COPY --from=base /app/drizzle.config.ts ./drizzle.config.ts

# Expose port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]

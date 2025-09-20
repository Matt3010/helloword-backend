# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies required for building Prisma & Node modules
RUN apk add --no-cache bash g++ git libc6-compat make openssl python3

# Copy package files and install ALL dependencies for building
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate the Prisma client during the build
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Stage 2: Production image ---
FROM node:22-alpine
WORKDIR /app

# Install runtime dependencies required by Prisma
RUN apk add --no-cache bash libc6-compat openssl

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated prisma client, built application, and Prisma schema from the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 4000

# SIMPLIFIED CMD: Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

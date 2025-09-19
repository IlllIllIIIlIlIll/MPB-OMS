# Base stage for building
FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client (skip for now)
# RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dependencies for native modules and Prisma
RUN apk add --no-cache libc6-compat openssl openssl-dev

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built application from base stage
COPY --from=base /app/dist ./dist

# Copy Prisma files (skip for now)
# COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
# COPY --from=base /app/prisma ./prisma

# Change ownership to app user
RUN chown -R nextjs:nodejs /app

# Switch to app user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]

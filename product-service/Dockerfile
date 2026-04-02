# Multi-stage build for optimization
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Production stage
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies and code as the nodejs user
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "src/server.js"]

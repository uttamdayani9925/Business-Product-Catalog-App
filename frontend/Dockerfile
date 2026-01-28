# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG REACT_APP_PRODUCT_API=http://localhost:5000/api/products
ARG REACT_APP_RATINGS_API=http://localhost:5001/api/ratings

# Set environment variables for build
ENV REACT_APP_PRODUCT_SERVICE_URL=$REACT_APP_PRODUCT_API
ENV REACT_APP_RATINGS_SERVICE_URL=$REACT_APP_RATINGS_API

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

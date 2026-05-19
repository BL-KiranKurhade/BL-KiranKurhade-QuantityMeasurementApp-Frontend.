# ================================================================
# QMA React Frontend  |  Port 80 (nginx)
# Multi-stage build: Node builder -> Nginx production server
# ================================================================

# ---- Stage 1: Build ------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build production bundle
# REACT_APP_API_URL is injected at build time (override via ARG if needed)
ARG REACT_APP_API_URL=http://localhost:8080
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

# ---- Stage 2: Serve with Nginx -------------------------------------
FROM nginx:1.25-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# Multi-stage Dockerfile for Responsive Viewer

# Stage 1: Build the web bundle
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (utilizing Docker layer caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and configurations
COPY . .

# Build the local/web platform bundle into build/
RUN npm run build:local

# Stage 2: Serve with lightweight Nginx
FROM nginx:1.25-alpine AS runner

# Label container metadata for GitHub Container Registry
LABEL org.opencontainers.image.title="Responsive Viewer"
LABEL org.opencontainers.image.description="Multi-Screen Responsive Design Browser Extension and Web Suite"
LABEL org.opencontainers.image.source="https://github.com/seogeoteam/responsive-viewer"
LABEL org.opencontainers.image.licenses="MIT"

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to nginx public html directory
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

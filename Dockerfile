# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_KEY
ARG VITE_SURREAL_URL
ARG VITE_SURREAL_NS=gemmavue
ARG VITE_SURREAL_DB=clinical
ARG VITE_SURREAL_USER=root
ARG VITE_SURREAL_PASS

# Set environment variables for build
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_SURREAL_URL=$VITE_SURREAL_URL
ENV VITE_SURREAL_NS=$VITE_SURREAL_NS
ENV VITE_SURREAL_DB=$VITE_SURREAL_DB
ENV VITE_SURREAL_USER=$VITE_SURREAL_USER
ENV VITE_SURREAL_PASS=$VITE_SURREAL_PASS

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

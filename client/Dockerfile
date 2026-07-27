# --------------------------------------
# Build Stage
# --------------------------------------
FROM node:24-slim AS build
WORKDIR /app

# Copy workspace manifests first for cache-friendly installs
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY engine/package.json engine/package.json
COPY server/package.json server/package.json

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --ignore-scripts

# Now bring in actual source
COPY engine ./engine
COPY client ./client

# engine must be built before client, since client imports its dist output
RUN npm run build -w engine
RUN npm run build -w client

# --------------------------------------
# Production Stage (nginx)
# --------------------------------------
FROM nginx:stable-alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
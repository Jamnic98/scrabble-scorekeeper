# --------------------------------------
# Build Stage
# --------------------------------------
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY engine/package.json engine/package.json

RUN npm install

COPY engine ./engine
COPY server ./server

RUN npm run build -w engine
RUN npm run build -w server

# --------------------------------------
# Production Stage
# --------------------------------------
FROM node:24-slim AS production
WORKDIR /app

# Need the manifests again to reinstall prod-only deps + recreate the workspace symlink
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY engine/package.json engine/package.json
COPY client/package.json client/package.json

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --ignore-scripts

# Bring in only the built output, not source
COPY --from=build /app/engine/dist ./engine/dist
COPY --from=build /app/server/dist ./server/dist

EXPOSE 8080
CMD ["node", "server/dist/index.js"]

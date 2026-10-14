# syntax=docker/dockerfile:1.7
FROM node:22-slim
WORKDIR /usr/src/server

RUN npm install -g pnpm@9
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=tomatometer-server-pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY docker/server.tsconfig.json ./tsconfig.json
COPY api ./api

RUN pnpm exec tsc -p ./tsconfig.json && \
    pnpm exec tsc-alias --project="./tsconfig.json" --resolve-full-paths

CMD [ "node", "./dist/backend.js"]

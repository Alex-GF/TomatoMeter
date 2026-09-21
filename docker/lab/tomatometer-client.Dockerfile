# syntax=docker/dockerfile:1.7
FROM node:21.1-slim AS build
WORKDIR /usr/src/client

RUN npm install -g pnpm@9
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=tomatometer-client-pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY public ./public

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN pnpm exec vite build

FROM nginx:1.27.3-alpine
COPY docker/lab/tomatometer-client-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/client/dist /usr/share/nginx/html

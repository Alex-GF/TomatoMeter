# syntax=docker/dockerfile:1.7
FROM node:22-slim AS build
WORKDIR /usr/src/client
RUN npm install -g pnpm@9
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=sphere-client-pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY src ./src
COPY public ./public
COPY tsconfig.json vite.config.ts index.html ./
# The original Sphere image copies .env before Vite builds.  The laboratory
# image is intentionally leaner, so retain its required public build values
# explicitly instead of leaving import.meta.env.VITE_API_URL undefined.
ARG VITE_API_URL=/api/v1
ARG VITE_SECRET_KEY=tomato-lab-sphere-client-secret
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SECRET_KEY=$VITE_SECRET_KEY
RUN pnpm run build

# The runtime image contains only static assets; this also avoids installing
# the development-only `serve` package on every frontend build.
FROM nginx:1.27.3-alpine
COPY --from=build /usr/src/client/dist /usr/share/nginx/html

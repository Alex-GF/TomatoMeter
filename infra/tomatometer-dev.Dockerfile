# Development image for the tutorial: the source code is bind-mounted at /app.
FROM node:22-slim
RUN npm install -g pnpm@9
ENV PNPM_STORE_DIR=/pnpm-store \
    npm_config_update_notifier=false
WORKDIR /app
CMD ["sh", "-c", "pnpm install --frozen-lockfile --store-dir \"$PNPM_STORE_DIR\" && pnpm dev"]

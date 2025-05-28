# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/server

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and ./pnpm-lock.yaml to the container
COPY ./package.json .
# Copy tsconfig.json to the container
COPY ./tsconfig.json .

RUN pnpm install

# Copy the rest of the application source code to the container
RUN mkdir src
COPY ./api ./src

RUN pnpm i tsc-alias@1.8.16

# Build your application
RUN pnpm exec tsc -p ./tsconfig.json && \
    pnpm exec tsc-alias --project="./tsconfig.json" --resolve-full-paths

# Specify the command to start the server
CMD [ "node", "dist/backend.js"]
# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/server

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and ./pnpm-lock.yaml to the container
COPY ./package.json .

RUN pnpm install

# Copy tsconfig.json to the container
COPY ./api/docker/tsconfig.json .

# Copy the rest of the application source code to the container
RUN mkdir src
COPY ./api ./api

ARG VITE_SPACE_URL
ENV VITE_SPACE_URL=$VITE_SPACE_URL

# Build your application
RUN pnpm exec tsc -p ./tsconfig.json && \
    pnpm exec tsc-alias --project="./tsconfig.json" --resolve-full-paths 

# Specify the command to start the server
CMD [ "node", "./dist/backend.js"]
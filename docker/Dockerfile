# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/server

# Copy package.json and ./pnpm-lock.yaml to the container
COPY ./package.json .
# Copy tsconfig.json to the container
COPY ./tsconfig.json .

# Install Node.js dependencies
RUN npm install 

# Copy the rest of the application source code to the container
RUN mkdir src
COPY ./src ./src
COPY ./index.html .

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# Build your application (the build phase of vite loads all envs)
RUN npx vite build && \
    npm install -g serve

# Specify the command to start your React app
CMD [ "serve", "-s", "dist", "-l", "5173" ]
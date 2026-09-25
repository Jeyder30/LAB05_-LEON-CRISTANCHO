# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .

ARG VITE_API_BASE_URL
ARG VITE_AUTH_BASE_URL
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AUTH_BASE_URL=$VITE_AUTH_BASE_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK

RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD [ "serve", "-s", "dist", "-l", "4173" ]

# STAGE 1: BUILD
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2: HOSTING
FROM nginx:alpine AS hosting

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/his-afp/browser /usr/share/nginx/html

EXPOSE 80

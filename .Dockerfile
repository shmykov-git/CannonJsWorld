# Этап 1: Сборка
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап 2: Запуск
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/certs /etc/nginx/certs
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

# Используем базовый образ Node.js
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код приложения
COPY . .

# Собираем приложение
RUN npm run build

# Указываем, что контейнер будет запускать Vite в режиме предварительного просмотра
EXPOSE 3333

CMD ["npm", "run", "preview"]

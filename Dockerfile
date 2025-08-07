# Dockerfile
FROM node:16

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar archivos de la aplicación
COPY . .

# Crear archivos JSON si no existen
RUN touch users.json comments.json
RUN echo '[]' > users.json
RUN echo '[]' > comments.json

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
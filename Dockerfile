# Usar imagen base de Node  
FROM node:22-alpine AS build  

# Establecer directorio de trabajo  
WORKDIR /app  

# Copiar archivos de dependencias  
COPY package*.json ./  

# Instalar dependencias  
RUN npm install  

# Copiar código fuente  
COPY . .  

# Construir proyecto para producción  
RUN npm run build  

# Imagen final con servidor nginx  
FROM nginx:alpine  

# Copiar dist de Angular a nginx  
COPY --from=build /app/dist/create_images_pdf /usr/share/nginx/html  

# Configurar puerto por defecto  
EXPOSE 80  

# Comando por defecto  
CMD ["nginx", "-g", "daemon off;"]
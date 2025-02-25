# Stage 1: Build the Angular application
FROM node:22.9.0 AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/internal-tools/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
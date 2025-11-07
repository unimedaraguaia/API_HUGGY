FROM nginx:latest

EXPOSE 8080

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs /nginx/certs


CMD ["nginx", "-g", "daemon off;"]
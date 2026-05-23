FROM nginx:alpine
COPY web/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080

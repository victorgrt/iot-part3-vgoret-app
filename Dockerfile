FROM nginx:alpine
COPY app/ /usr/share/nginx/html/
# listen on 8888 instead of default port:80
RUN sed -i 's/listen\s*80;/listen 8888;/' /etc/nginx/conf.d/default.conf

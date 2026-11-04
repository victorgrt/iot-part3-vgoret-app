FROM nginx:alpine
COPY app/ /usr/share/nginx/html/
RUN sed -i 's/listen\s*80;/listen 8888;/' /etc/nginx/conf.d/default.conf
EXPOSE 8888

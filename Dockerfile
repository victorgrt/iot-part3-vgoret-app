FROM nginx:alpine
COPY app/ /usr/share/nginx/html/
ARG APP_VERSION=dev
RUN sed -i "s/data-app-version=\"[^\"]*\"/data-app-version=\"${APP_VERSION}\"/" /usr/share/nginx/html/index.html
RUN sed -i 's/listen\s*80;/listen 8888;/' /etc/nginx/conf.d/default.conf
EXPOSE 8888

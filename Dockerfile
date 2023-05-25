FROM node:16 AS builder

ARG IP
ARG PORT

WORKDIR /builder


COPY package.json ./

RUN npm config set legacy-peer-deps true

RUN npm install 

COPY . ./

COPY deploy.sh /deploy.sh

RUN sed -i "s/{{IP}}/$IP/g" /deploy.sh && \
    sed -i "s/{{PORT}}/$PORT/g" /deploy.sh && \
    chmod +x /deploy.sh

RUN ./deploy.sh -p

# Production image

FROM registry.access.redhat.com/ubi8/nginx-118

USER root

COPY --from=builder /builder/dist/* ./

USER default

WORKDIR /etc/nginx

RUN cp nginx.conf /tmp
RUN sed -i 's|listen       \[::\]:8080 default_server|listen       8080|' /tmp/nginx.conf
RUN sed -i 's|listen       8080 default_server;||' /tmp/nginx.conf
RUN cat /tmp/nginx.conf >nginx.conf

Expose 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]

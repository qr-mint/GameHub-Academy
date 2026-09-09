FROM node:21.1.0 as builder

WORKDIR /game

# COPY package*.json ./

# RUN npm install

COPY . .

# RUN npm run build:soft

FROM nginx:latest

COPY --from=builder /game/build /usr/share/nginx/html

COPY nginx/conf.d /etc/nginx/conf.d

RUN unlink /var/log/nginx/access.log && unlink /var/log/nginx/error.log

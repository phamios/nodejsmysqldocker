FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm update
RUN npm install  
RUN npm fund

COPY . /usr/src/app
# COPY wait-for-it.sh /usr/src/app

EXPOSE 6802

# CMD npm run docker
RUN node runservice.js
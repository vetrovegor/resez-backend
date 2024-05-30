FROM node:20.10.0-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY build build

EXPOSE 8080

CMD ["npm", "start"]
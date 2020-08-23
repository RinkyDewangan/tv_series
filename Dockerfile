FROM node:latest

WORKDIR /service

COPY . /service

RUN pwd

COPY package.json ./

COPY tsconfig.json ./

COPY tslint.json ./

COPY a.ts ./

RUN npm install

RUN npm run build

COPY src/config.json ./dist/config.json

EXPOSE 5000

CMD ["npm","start"]

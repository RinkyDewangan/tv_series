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

EXPOSE 5000

CMD ["npm","start"]

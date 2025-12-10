FROM node:24.11.1-alpine3.22

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install --silent --progress=false

COPY ./config ./config
COPY ./src ./src

COPY ./index.html .

CMD ["npm", "run", "dev"]
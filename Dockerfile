FROM node:12

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json package.json

RUN npm i

COPY . .

COPY ./dist/rqlite-linux dist/rqlite-linux

CMD ["node", "index-docker.js"]

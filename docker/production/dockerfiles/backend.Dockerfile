FROM node:24

ENV NODE_ENV=PRODUCTION

WORKDIR /app

COPY ./backend/ ./

RUN npm ci
RUN npm i -g @nestjs/cli
RUN npm run build

CMD ["npm", "run", "start:prod"]
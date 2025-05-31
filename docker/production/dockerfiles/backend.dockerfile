FROM node:24

ENV NODE_ENV production

WORKDIR /app

COPY ./backend .

RUN npm ci
RUN npm i @nestjs/cli
RUN npm run build

CMD ["npm", "run", "start:prod"]
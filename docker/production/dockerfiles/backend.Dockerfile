FROM node:24

ARG ADMIN_CHAT_ID
ARG CHANNEL_ID
ARG GROUP_CHAT_ID
ARG MODERATOR_CHAT_ID
ARG TELEGRAM_BOT_TOKEN

ENV NODE_ENV=PRODUCTION

WORKDIR /app

COPY ./backend/ ./

RUN npm ci
RUN npm i -g @nestjs/cli
RUN npm run build

CMD ["npm", "run", "start:prod"]
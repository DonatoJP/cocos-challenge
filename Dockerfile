FROM --platform=linux/amd64 node:22.14.0-alpine3.21 AS deps

RUN npm install -g @nestjs/cli
WORKDIR /src

COPY package*.json ./
RUN npm ci

COPY . .
RUN nest build

FROM --platform=linux/amd64 node:22.14.0-alpine3.21 AS release

RUN apk add --update curl redis
WORKDIR /app

COPY --from=deps /src/dist ./dist
COPY --from=deps /src/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]
FROM node:20-slim

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ["yarn", "dev", "--hostname", "0.0.0.0"] 
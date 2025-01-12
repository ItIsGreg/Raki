FROM node:20-slim

WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./

# Copy the scripts directory separately before yarn install
COPY scripts/copy-pdf-worker.mjs scripts/

# Run yarn install
RUN yarn install

# Copy remaining files
COPY . .

CMD ["yarn", "dev", "--hostname", "0.0.0.0"] 
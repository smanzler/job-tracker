FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install
RUN pnpm exec playwright install chromium --with-deps

COPY . .

RUN pnpm build
CMD ["pnpm", "start"]
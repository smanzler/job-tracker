FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install
RUN pnpm exec playwright install chromium --with-deps

RUN node -e "(async () => { const { pipeline } = await import('@huggingface/transformers'); await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype: 'q8' }); })()"

COPY . .

RUN pnpm build
CMD ["pnpm", "start"]
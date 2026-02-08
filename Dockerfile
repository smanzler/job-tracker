FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install
RUN pnpm exec playwright install chromium --with-deps

RUN node -e "(async () => { const { pipeline } = await import('@huggingface/transformers'); await pipeline('feature-extraction', 'onnx-community/Qwen3-Embedding-0.6B-ONNX'); })()"

COPY . .

RUN pnpm build
CMD ["pnpm", "start"]
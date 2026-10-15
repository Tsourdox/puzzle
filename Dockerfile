FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
CMD ["bun", "server/index.ts"]

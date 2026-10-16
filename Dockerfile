FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# A type or lint error fails the deploy, and the running version stays up
RUN bun run types && bun run lint && bun run build
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
CMD ["bun", "server/index.ts"]

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
# Prisma di Alpine (musl) butuh openssl untuk engine-nya.
RUN apk add --no-cache openssl && corepack enable
COPY package.json ./
COPY prisma ./prisma
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm prisma generate && pnpm build

# ---- run ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl && corepack enable
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Dibutuhkan untuk seed sekali (data awal): file JSON aset & tsconfig utk ts-node.
COPY --from=build /app/extracted-json ./extracted-json
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY package.json ./
EXPOSE 4000
# Sinkronkan skema ke DB lalu jalankan API (idempotent; aman diulang).
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]

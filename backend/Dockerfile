FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" ./node_modules/.bin/prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p uploads/products uploads/categories uploads/banners uploads/brands

EXPOSE 8000
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main"]

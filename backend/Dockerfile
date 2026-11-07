FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
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
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

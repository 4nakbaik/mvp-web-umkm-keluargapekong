# --- Builder ---
FROM node:18-alpine AS builder

RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Runner ---
FROM node:18-alpine AS runner

RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p public/uploads && chown -R node:node public
USER node
EXPOSE 5000
CMD sh -c "npx prisma migrate deploy && node dist/app.js"
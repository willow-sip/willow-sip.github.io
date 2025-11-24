FROM node:20-alpine AS builder
RUN apk add --no-cache tar

WORKDIR /app

COPY package*.json ./
COPY packages ./packages

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

COPY --from=builder /app/build/standalone ./
COPY --from=builder /app/build/static ./build/static

EXPOSE 3000
CMD ["node", "server.js"]
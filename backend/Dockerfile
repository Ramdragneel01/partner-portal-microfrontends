FROM cgr.dev/chainguard/node:latest-dev AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM gcr.io/distroless/nodejs22-debian12:nonroot

ENV NODE_ENV=production

WORKDIR /app

COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot package.json ./package.json
COPY --chown=nonroot:nonroot src ./src

EXPOSE 5000

CMD ["src/server.js"]

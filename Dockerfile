# conoceme-aun-mas — single container: API + SPA (Railway-friendly)
# Railway injects $PORT at runtime; HOST stays 0.0.0.0

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
# Optional: bake local VITE key (prefer PUBLIC_COMPANION_KEY at runtime in prod)
ARG VITE_PORTFOLIO_API_KEY=
ENV VITE_PORTFOLIO_API_KEY=$VITE_PORTFOLIO_API_KEY
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787 \
    CONTENT_ROOT=/app/content \
    STATIC_ROOT=/app/apps/frontend/dist

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=build /app/content ./content

EXPOSE 8787
# Railway uses its own health checks; this helps docker compose / local
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const p=process.env.PORT||8787;fetch('http://127.0.0.1:'+p+'/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/backend/dist/main.js"]

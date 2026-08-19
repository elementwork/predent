# syntax=docker/dockerfile:1
FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

COPY . .
RUN node tools/prepare-manipat-runtime.mjs
RUN npm run build

FROM node:24-alpine AS production-dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:24-alpine AS production

WORKDIR /app

RUN apk add --no-cache ca-certificates

ARG VCS_REF="unknown"
ARG BUILD_DATE="unknown"
LABEL org.opencontainers.image.title="PreDent Canada" \
      org.opencontainers.image.source="https://github.com/elementwork/predent" \
      org.opencontainers.image.revision="$VCS_REF" \
      org.opencontainers.image.created="$BUILD_DATE"

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/vendor/manipat/packages ./vendor/manipat/packages
COPY --from=build --chown=node:node /app/vendor/manipat/node_modules ./vendor/manipat/node_modules
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./package.json

RUN mkdir -p ./node_modules/@manipat \
 && for pkg in core geometry object-generator svg pat-angle pat-aperture pat-cube-counting pat-form-development pat-paper-folding pat-view-recognition question-bank renderer-three; do \
      ln -s ../../vendor/manipat/packages/$pkg ./node_modules/@manipat/$pkg; \
    done \
 && ln -s ../vendor/manipat/packages/geometry/node_modules/manifold-3d ./node_modules/manifold-3d \
 && ln -s ../vendor/manipat/packages/renderer-three/node_modules/three ./node_modules/three \
 && chown -h node:node ./node_modules/@manipat/* ./node_modules/manifold-3d ./node_modules/three

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "start"]

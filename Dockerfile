FROM node:22-slim AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.base.json preinstall.mjs ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/db/package.json lib/db/package.json
COPY scripts/package.json scripts/package.json

RUN pnpm install --frozen-lockfile

COPY artifacts/api-server artifacts/api-server
COPY lib lib

RUN pnpm --filter "./artifacts/api-server" run build

FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app
RUN corepack enable

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/preinstall.mjs ./
COPY --from=build /app/artifacts/api-server/package.json artifacts/api-server/package.json
COPY --from=build /app/lib/api-zod/package.json lib/api-zod/package.json
COPY --from=build /app/artifacts/api-server/dist artifacts/api-server/dist
COPY --from=build /app/lib/api-zod lib/api-zod

RUN pnpm install --prod --frozen-lockfile --filter "./artifacts/api-server..."

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]

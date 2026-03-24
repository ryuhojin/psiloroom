FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma

RUN pnpm install --no-frozen-lockfile

CMD ["pnpm", "--version"]

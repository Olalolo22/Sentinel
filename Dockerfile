FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/rules/package.json packages/rules/
RUN npm ci
COPY tsconfig.base.json ./
COPY packages/rules packages/rules
COPY apps/api apps/api
RUN npm run build -w packages/rules && npm run build -w apps/api

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/packages/rules/package.json packages/rules/
RUN npm ci --omit=dev
COPY --from=build /app/packages/rules/dist packages/rules/dist
COPY --from=build /app/apps/api/dist apps/api/dist
EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]

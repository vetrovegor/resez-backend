###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20.10.0-alpine As development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npx prisma generate

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20.10.0-alpine As build

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:20.10.0-alpine As production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/prisma /app/prisma

CMD ["sh", "-c", "npx prisma migrate deploy && node /app/dist/main.js"]
# Stage 1 - the build react app
FROM --platform=linux/amd64  node:20.12.2-alpine3.19 as build-deps
WORKDIR /usr/src/app
COPY client/package.json client/package-lock.json ./
RUN npm i --legacy-peer-deps

COPY client/ ./
RUN npm run build

# Stage 2 - the production environment
FROM --platform=linux/amd64  node:20.12.2-alpine3.19

RUN apk add --no-cache tini
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN chown -R node:node /usr/src/app/
EXPOSE 4654

COPY server/package.json  ./
RUN npm i --production

COPY --from=build-deps /usr/src/app/build /usr/src/app/public
COPY /server ./

# USER 1000 is the "node" user
# This is to avoid the "container has runAsNonRoot and image has non-numeric user (node), cannot verify user is non-root"
# in clusters with PSP enabled
USER 1000

ENTRYPOINT ["/sbin/tini", "--", "node", "."]

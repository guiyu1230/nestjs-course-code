FROM node:18.0-alpine3.14 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18.0-alpine3.14 as production-stage

WORKDIR /app

COPY --from=build-stage /app/dist /app/dist
COPY --from=build-stage /app/public /app/public
COPY --from=build-stage /app/uploads /app/uploads
COPY --from=build-stage /app/views /app/views
COPY --from=build-stage /app/package.json /app/package.json

RUN npm install --production

RUN npm install -g pm2

EXPOSE 3000

CMD [ "pm2-runtime", "/app/dist/main.js" ]
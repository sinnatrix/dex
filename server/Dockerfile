# build environment
FROM node:10.12.0-alpine as builder
RUN mkdir /server
WORKDIR /server
ENV PATH /server/node_modules/.bin:$PATH
COPY package.json /server/package.json
RUN apk update
RUN apk add --no-cache autoconf make gcc g++ git python
RUN yarn install --pure-lockfile --ignore-optional
COPY . /server

# production environment
FROM node:10.12.0-alpine
COPY --from=builder /server /server
WORKDIR /server
ENV PATH /server/node_modules/.bin:$PATH
EXPOSE 7001

CMD ["yarn", "start"]

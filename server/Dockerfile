# builder environment
FROM node:10.13.0-alpine as builder
RUN apk update
RUN apk add --no-cache autoconf make gcc g++ git python libgudev-dev linux-headers eudev-dev libusb-compat-dev hwdata-usb
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn install --pure-lockfile
COPY . /app

# production environment
FROM node:10.13.0-alpine
COPY --from=builder /app /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
EXPOSE 80

CMD ["yarn", "start"]

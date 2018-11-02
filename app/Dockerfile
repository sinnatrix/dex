# build environment
FROM node:10.12.0-alpine as builder
RUN apk update
RUN apk add --no-cache autoconf make gcc g++ git python
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN yarn install --ignore-optional --pure-lockfile
# --silent
COPY . /app
RUN yarn build

# production environment
FROM nginx:1.15.5-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:10.5.0-alpine

ENV PORT 80
ENV NODE_ENV production 

EXPOSE 80

RUN npm set audit false
RUN npm -v && node -v && yarn -v

RUN mkdir -p /var/www/

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn
RUN mkdir -p /var/www/ && cp -a /tmp/node_modules /var/www/

WORKDIR /var/www/
COPY . /var/www/

RUN ls -la

#RUN npm install --package-lock-only
RUN yarn install --prod
#RUN yarn add babel-cli

#RUN yarn build

# Run app
CMD yarn start

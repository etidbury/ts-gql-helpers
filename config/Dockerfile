FROM node:10.5.0-alpine

ENV PORT 80
ENV NODE_ENV production 

EXPOSE 80

RUN npm set audit false
RUN npm -v && node -v && yarn -v

RUN mkdir -p /var/www/

WORKDIR /var/www/

COPY . /var/www/

RUN ls -la

#RUN npm install --package-lock-only
RUN yarn install --prod
#RUN yarn add babel-cli

#RUN yarn build

# Run app
CMD yarn start

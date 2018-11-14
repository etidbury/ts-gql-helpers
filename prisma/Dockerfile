# Pull prisma image from dockerhub
FROM prismagraphql/prisma:1.19.0

#RUN printenv && echo "done"

# Tell docker there are arguments we need
ARG MYSQL_HOST
ARG MYSQL_USER
ARG MYSQL_PASSWORD
ARG PRISMA_MANAGEMENT_API_SECRET
#ARG PRISMA_CONFIG_PATH

COPY db.yml db.yml
COPY prisma.yml prisma.yml

#RUN cat db.yml
# Copy build-time environment varibles into config
RUN sed -i s/MYSQL_HOST/$MYSQL_HOST/g db.yml
RUN sed -i s/MYSQL_USER/$MYSQL_USER/g db.yml
RUN sed -i s/MYSQL_PASSWORD/$MYSQL_PASSWORD/g db.yml
RUN sed -i s/PRISMA_MANAGEMENT_API_SECRET/$PRISMA_MANAGEMENT_API_SECRET/g db.yml

RUN cat db.yml
# Sets an server run-time environment variable to tell Prisma where to find the 
# server configuration. (Prisma.yml holds the Prisma config in the instance.
# This is a different prisma.yml to the one 'prisma deploy' uses)
ENV PRISMA_CONFIG_PATH db.yml

# Copy over config to server

# Exposes Prisma port to 80/443 i.e. :4466 is not needed at the end of the server URL
EXPOSE 4466


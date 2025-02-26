FROM node:23-alpine3.20
RUN apk add --no-cache dcron

WORKDIR /usr/src/app

COPY . .
COPY .env .

RUN npm install && npm run build

# Setup crontab
RUN echo "*/10 * * * * cd /usr/src/app && npm run changeTorrentLocation >> /var/log/cron.log 2>&1" > /etc/crontabs/root

RUN echo "0 4 * * * cd /usr/src/app && npm run renameFiles >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# cron log file
RUN touch /var/log/cron.log

# Start cron and follow logs
CMD crond -f && tail -f /var/log/cron.log

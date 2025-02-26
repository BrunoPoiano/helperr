FROM node:23-alpine3.20
RUN apk add --no-cache dcron

WORKDIR /usr/src/app

COPY . .
COPY .env .

RUN npm install && npm run build

# Setup crontab

RUN echo "*/5 * * * * cd /usr/src/app && npm run check >> /var/log/cron.log 2>&1" > /etc/crontabs/root

RUN echo "0 4 * * * cd /usr/src/app && npm run renameFiles >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# cron log file
RUN touch /var/log/cron.log

# Create and make executable the start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Use the start script
CMD ["/start.sh"]

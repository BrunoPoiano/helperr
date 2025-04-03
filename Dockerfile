
FROM node:23-alpine3.20
RUN apk add --no-cache dcron

WORKDIR /usr/src/app

COPY . .

RUN npm install && npm run build

# Setup crontab - Fixed spacing in cron expressions

# run check on series and movies
RUN echo "*/10 * * * * cd /usr/src/app && npm run check >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# run rename movies
RUN echo "0 4 * * * cd /usr/src/app && npm run renameFiles >> /var/log/cron.log 2>&1" >> /etc/crontabs/root

# run search on missing series eps
RUN echo "0 5 * * * cd /usr/src/app && npm run missingSeries >> /var/log/cron.log 2>&1" >> /etc/crontabs/root


# cron log file
RUN touch /var/log/cron.log

# Create and make executable the start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Use the start script
CMD ["/start.sh"]

FROM node:23-alpine3.20
# Install dcron for scheduling tasks
RUN apk add --no-cache dcron

# Set working directory
WORKDIR /usr/src/app

# Copy all files from current directory to working directory
COPY . .

# Install timezone data
RUN apk add --no-cache tzdata
# Install dependencies and build application
RUN npm install && npm run build

# Setup crontab with properly formatted cron expressions

# Run check on series and movies every 10 minutes between midnight-5:59AM and 9AM-11:59PM
RUN echo "*/10 0-5,9-23 * * * cd /usr/src/app && npm run check >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Run rename files task daily at 7:00AM
RUN echo "0 7 * * * cd /usr/src/app && npm run renameFiles >> /var/log/cron.log 2>&1" >> /etc/crontabs/root

# Run search for missing series and movies daily at 8:00AM
RUN echo "0 8 * * * cd /usr/src/app && npm run checkMissing >> /var/log/cron.log 2>&1" >> /etc/crontabs/root

# Create empty log file for cron output
RUN touch /var/log/cron.log

# Copy startup script and make it executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Execute the startup script when container launches
CMD ["/start.sh"]

FROM golang:1.24.2-alpine3.21 AS builder

# Set the working directory for the build stage
WORKDIR /build

# Copy only files needed for building
COPY . .

# Build the Go application with static linking to reduce dependencies
RUN go mod init helperr
RUN go build -ldflags="-X 'main.Version=v2.0.4'"

# Use a smaller Alpine base for the final image
FROM alpine:3.21

# Set the working directory for the application
WORKDIR /app/helperr

# Install timezone data
RUN apk add --no-cache tzdata
# Setup crontab with properly formatted cron expressions

# Run check on series and movies every 10 minutes between midnight-5:59AM and 9AM-11:59PM
RUN echo "*/10 0-5,9-23 * * * cd /app/helperr && ./helperr relocate >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Run rename files task daily at 7:00AM
RUN echo "0 7 */3 * * cd /app/helperr && ./helperr rename >> /var/log/cron.log 2>&1" >> /etc/crontabs/root

# Run search for missing series and movies daily at 8:00AM
RUN echo "0 8 * * * cd /app/helperr && ./helperr missing >> /var/log/cron.log 2>&1" >> /etc/crontabs/root

# Create empty log file for cron output
RUN touch /var/log/cron.log
# Copy only the compiled binary from the builder stage
COPY --from=builder /build/helperr ./

# Copy startup script and make it executable
COPY start.sh ./
RUN chmod +x ./start.sh

# Execute the startup script when container launches
CMD ["/bin/sh", "./start.sh"]

# Qbit-relocater

Qbit-Relocater is a script that seamlessly integrates with Sonarr, Radarr, and qBittorrent to relocate torrents to the correct folders.

It ensures that files and folders are renamed and moved without breaking qBittorrent's links, eliminating the need for hardlinks or relying on Sonarr/Radarr to move or copy files. This allows for a cleaner, more efficient media management workflow.

## Automatic Actions

The script performs the following automated tasks:
- Every 10 minutes: Runs a check for moving files
- Once a day: Renames movie and series files
- Once a day: Checks for missing movies/series episodes

## Before Deployment

- Both Radarr and Sonarr should be at least **version 3+**
- In qBittorrent:
    - The `tv-sonarr` category should be set for Sonarr
    - The `radarr` category should be set for Radarr
- In Radarr/Sonarr:
    - `Completed Download Handling` must be `disabled`

*Recommended settings*
- In qBittorrent: Enable `Keep incomplete torrents in`
- In Sonarr/Radarr: Enable `Rename Episodes`
- In Radarr/Sonarr qBittorrent settings: Set `Content Layout` as Original

## Deployment
You can find the Docker image here: [qbit-relocator image](https://hub.docker.com/r/brunopoiano/qbit-relocater)

### Using Docker Image
command line
```bash
docker run -d \
  --name qbit-relocater \
  --restart unless-stopped \
  -e TZ="America/Sao_Paulo" \
  -e RADARR_QBITTORRENT_URL="http://localhost:8080" \
  -e RADARR_QBITTORRENT_USERNAME="" \
  -e RADARR_QBITTORRENT_PASSWORD="" \
  -e RADARR_URL="http://localhost:7878" \
  -e RADARR_API_KEY="" \
  -e RADARR_DOWNLOAD_PATH="/downloads/movies/" \
  -e SONARR_QBITTORRENT_URL="http://localhost:8080" \
  -e SONARR_QBITTORRENT_USERNAME="" \
  -e SONARR_QBITTORRENT_PASSWORD="" \
  -e SONARR_URL="http://localhost:8989" \
  -e SONARR_API_KEY="" \
  -e SONARR_DOWNLOAD_PATH="/downloads/shows/" \
  -e MISSING_FILES_SEARCH_INTERVAL=2880 \
  -e TELEGRAM_BOT_TOKEN="" \
  -e TELEGRAM_CHAT_ID="" \
  -e DISCORD_URL="" \
  -e DISCORD_USERNAME="Qbit-Renamer" \
  docker.io/brunopoiano/qbit-relocater
```

or docker-compose.yaml
```yaml
services:
  qbit-relocater:
    image: docker.io/brunopoiano/qbit-relocater
    environment:
      TZ: America/Sao_Paulo
      RADARR_QBITTORRENT_URL: "http://localhost:8080"
      RADARR_QBITTORRENT_USERNAME: ""
      RADARR_QBITTORRENT_PASSWORD: ""
      RADARR_URL: "http://localhost:7878"
      RADARR_API_KEY: ""
      RADARR_DOWNLOAD_PATH: "/downloads/movies/"
      SONARR_QBITTORRENT_URL: "http://localhost:8080"
      SONARR_QBITTORRENT_USERNAME: ""
      SONARR_QBITTORRENT_PASSWORD: ""
      SONARR_URL: "http://localhost:8989"
      SONARR_API_KEY: ""
      SONARR_DOWNLOAD_PATH: "/downloads/shows/"
      MISSING_FILES_SEARCH_INTERVAL: 2880
      #optional:
      TELEGRAM_BOT_TOKEN: ""
      TELEGRAM_CHAT_ID: ""
      DISCORD_URL: ""
      DISCORD_USERNAME: "Qbit-Renamer"
    restart: unless-stopped
    container_name: qbit-relocater
```

Start the container:
```bash
docker compose up -d
```

### Building from Source Code

```bash
git clone git@github.com:BrunoPoiano/qbit-relocater.git
cd qbit-relocater
```
Edit environment variables with your configuration
Build and run the container:
```bash
docker build -t qbit-relocater .
docker compose up -d
```

## Manual Operations

The following commands can be used to manually trigger specific operations:

```bash
# Scan and process movies
docker exec qbit-relocater npm run checkMovies

# Scan and process TV series
docker exec qbit-relocater npm run checkSeries

# Test Notifications
docker exec qbit-relocater npm run testNotification

# Search for missing movies
docker exec qbit-relocater npm run missingMovies

# Search for missing TV episodes
docker exec qbit-relocater npm run missingSeries

# Rename movie files
docker exec qbit-relocater npm run renameMovies

# Rename TV series episodes
docker exec qbit-relocater npm run renameSeries

# Run full check for both movies and series
docker exec qbit-relocater npm run check

# Run check for all missing content
docker exec qbit-relocater npm run checkMissing

# Run rename operation for all content
docker exec qbit-relocater npm run renameFiles
```

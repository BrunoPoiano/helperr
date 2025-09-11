# Helperr

Helperr is a service that provides several improvements to Sonarr, Radarr, and qBittorrent integration for media management.

It integrates with Sonarr, Radarr, and qBittorrent to **relocate torrents** to the correct folders. This ensures that files and folders are renamed and moved _without breaking qBittorrent's links_, eliminating the need for hardlinks or relying on Sonarr/Radarr to move or copy files. This results in a cleaner, more efficient media management workflow.

Helperr also includes features to:

- Check for missing content
- Automatically rename files
- Analyze torrents to prevent the download of unwanted extensions

## Automatic Actions

The script performs the following automated tasks:

- Every 10 minutes:
  - Check for new files to relocate
  - Verify files for unwanted extensions
- Once a day: Renames movie and series files
- Once a day: Checks for missing movies/series episodes

## Before Deployment

- Both Radarr and Sonarr should be at least **version 3+**
- In qBittorrent:
  - The `tv-sonarr` category should be set for Sonarr
  - The `radarr` category should be set for Radarr
- In Radarr/Sonarr:
  - `Completed Download Handling` must be `disabled`

_Recommended settings_

- In qBittorrent: Enable `Keep incomplete torrents in`
- In Sonarr/Radarr: Enable `Rename Episodes`
- In Radarr/Sonarr qBittorrent settings: Set `Content Layout` as Original

## Deployment

You can find the Docker image here: [helperr image](https://hub.docker.com/r/brunopoiano/helperr)

### Using Docker Image

command line

```bash
docker run -d \
  --name helperr \
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
  -e UNDESIRED_EXTENTIONS="[.exe,.rar]" \
  docker.io/brunopoiano/helperr
```

or docker-compose.yaml

```yaml
services:
  helperr:
    image: docker.io/brunopoiano/helperr
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
      DISCORD_USERNAME: "helperr"
      UNDESIRED_EXTENTIONS: "[.exe,.rar]"
    restart: unless-stopped
    container_name: helperr
```

Start the container:

```bash
docker compose up -d
```

### Building from Source Code

```bash
git clone git@github.com:BrunoPoiano/helperr.git
cd helperr
```

Edit environment variables with your configuration
Build and run the container:

```bash
docker build -t helperr .
docker compose up -d
```

## Manual Operations

The following commands can be used to manually trigger specific operations:

```bash
# Scan and process movies
docker exec helperr npm run checkMovies

# Scan and process TV series
docker exec helperr npm run checkSeries

# Test Notifications
docker exec helperr npm run testNotification

# Search for missing movies
docker exec helperr npm run missingMovies

# Search for missing TV episodes
docker exec helperr npm run missingSeries

# Rename movie files
docker exec helperr npm run renameMovies

# Rename TV series episodes
docker exec helperr npm run renameSeries

# Run full check for both movies and series
docker exec helperr npm run check

# Run check for all missing content
docker exec helperr npm run checkMissing

# Run rename operation for all content
docker exec helperr npm run renameFiles
```

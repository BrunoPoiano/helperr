# Helperr

Helperr is a service that provides several improvements to Sonarr, Radarr, and qBittorrent integration for media management.

It integrates with Sonarr, Radarr, and qBittorrent to **relocate torrents** to the correct folders. This ensures that files and folders are renamed and moved _without breaking qBittorrent's links_, eliminating the need for hardlinks or relying on Sonarr/Radarr to move or copy files. This results in a cleaner, more efficient media management workflow.

Helperr also includes features to:

- Check for missing content
- Automatically rename files
- Analyze torrents to prevent the download of unwanted extensions
- Notify users via Telegram and Discord

## Automatic Actions

The script performs the following automated tasks:

- Every 10 minutes:
  - Check for new files to relocate
  - Verify files for unwanted extensions
- Once a day:
  - Rename movie and series files
  - Check for missing movies/series episodes

## Prerequisites

Before deploying Helperr, ensure the following:

- **Sonarr and Radarr**: Version 3+ is required.
- **qBittorrent**:
  - The `tv-sonarr` category should be set for Sonarr.
  - The `radarr` category should be set for Radarr.
- **Sonarr/Radarr**:
  - `Completed Download Handling` must be disabled.

### Recommended Settings

- In qBittorrent: Enable `Keep incomplete torrents in`.
- In Sonarr/Radarr: Enable `Rename Episodes`.
- In Sonarr/Radarr qBittorrent settings: Set `Content Layout` to `Original`.

## Deployment

You can find the Docker image here: [helperr image](https://hub.docker.com/r/brunopoiano/helperr).

### Using Docker Image

#### Command Line

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

#### Docker Compose

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
      # Optional:
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

Edit environment variables with your configuration. Build and run the container:

```bash
docker build -t helperr .
docker compose up -d
```

## Manual Operations

The following commands can be used to manually trigger specific operations:

```bash
# Check for missing movies and TV series
docker exec helperr ./helperr missing

# Rename all movie and TV series files
docker exec helperr ./helperr rename

# Relocate all movie and TV series files
docker exec helperr ./helperr relocate

# Check notifications for both Telegram and Discord
docker exec helperr ./helperr check-notifications

# Check for missing TV series episodes
docker exec helperr ./helperr missing-series

# Check for missing movies
docker exec helperr ./helperr missing-movies

# Rename TV series episodes
docker exec helperr ./helperr rename-series

# Rename movie files
docker exec helperr ./helperr rename-movies

# Relocate TV series episodes
docker exec helperr ./helperr relocate-series

# Relocate movie files
docker exec helperr ./helperr relocate-movies

# Test Telegram notifications
docker exec helperr ./helperr check-telegram

# Test Discord notifications
docker exec helperr ./helperr check-discord
```

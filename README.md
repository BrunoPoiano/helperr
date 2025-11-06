# Helperr

Helperr is a service that provides several improvements to Sonarr, Radarr, Lidarr, and qBittorrent integration for media management.

It integrates with Sonarr, Radarr, Lidarr, and qBittorrent to **relocate torrents** to the correct folders. This ensures that files and folders are renamed and moved _without breaking qBittorrent's links_, eliminating the need for hardlinks or relying on Sonarr/Radarr/Lidarr to move or copy files. This results in a cleaner, more efficient media management workflow.

Helperr also includes features to:

- Check for missing content (TV episodes, movies, and music)
- Automatically rename files
- Analyze torrents to prevent the download of unwanted extensions
- Notify users via Telegram and Discord

## Supported Services

- **Sonarr** - TV series management
- **Radarr** - Movie management
- **Lidarr** - Music management
- **qBittorrent** - Torrent client

## Automatic Actions

The script performs the following automated tasks:

- Every 10 minutes:
  - Check for new files to relocate (series, movies, and music)
  - Verify files for unwanted extensions
- Once a day:
  - Rename movie, series, and music files
  - Check for missing movies/series episodes

## Prerequisites

Before deploying Helperr, ensure the following:

- **Sonarr, Radarr, and Lidarr**: Version 3+ is required (Lidarr v1+ API).
- **qBittorrent**:
  - The `tv-sonarr` category should be set for Sonarr.
  - The `radarr` category should be set for Radarr.
  - The `lidarr` category should be set for Lidarr.
- **Sonarr/Radarr/Lidarr**:
  - `Completed Download Handling` must be disabled.

### Recommended Settings

- In qBittorrent: Enable `Keep incomplete torrents in`.
- In Sonarr/Radarr/Lidarr: Enable `Rename Episodes`.
- In Sonarr/Radarr/Lidarr qBittorrent settings: Set `Content Layout` to `Original`.

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
  -e LIDARR_QBITTORRENT_URL="http://localhost:8080" \
  -e LIDARR_QBITTORRENT_USERNAME="" \
  -e LIDARR_QBITTORRENT_PASSWORD="" \
  -e LIDARR_URL="http://localhost:8686" \
  -e LIDARR_API_KEY="" \
  -e LIDARR_DOWNLOAD_PATH="/downloads/music/" \
  -e MISSING_FILES_SEARCH_INTERVAL=2880 \
  -e TELEGRAM_BOT_TOKEN="" \
  -e TELEGRAM_CHAT_ID="" \
  -e DISCORD_URL="" \
  -e DISCORD_USERNAME="Helperr" \
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
      LIDARR_QBITTORRENT_URL: "http://localhost:8080"
      LIDARR_QBITTORRENT_USERNAME: ""
      LIDARR_QBITTORRENT_PASSWORD: ""
      LIDARR_URL: "http://localhost:8686"
      LIDARR_API_KEY: ""
      LIDARR_DOWNLOAD_PATH: "/downloads/music/"
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

## Environment Variables

### Global Configuration

- **`TZ`** - Timezone (default: America/Sao_Paulo)
- **`MISSING_FILES_SEARCH_INTERVAL`** - Minutes between missing file searches (default: 2880 = 2 days)
- **`UNDESIRED_EXTENTIONS`** - Array of file extensions to reject (default: `[.arj, .ink, .lnk, .exe, .rar, .iso]`)

### Sonarr Configuration

- **`SONARR_URL`** - Sonarr API URL (default: http://localhost:8989)
- **`SONARR_API_KEY`** - Sonarr API key
- **`SONARR_DOWNLOAD_PATH`** - Download path for TV shows (default: /downloads/shows/)
- **`SONARR_QBITTORRENT_URL`** - qBittorrent URL for Sonarr (default: http://localhost:8080)
- **`SONARR_QBITTORRENT_USERNAME`** - qBittorrent username (default: admin)
- **`SONARR_QBITTORRENT_PASSWORD`** - qBittorrent password (default: admin)

### Radarr Configuration

- **`RADARR_URL`** - Radarr API URL (default: http://localhost:7878)
- **`RADARR_API_KEY`** - Radarr API key
- **`RADARR_DOWNLOAD_PATH`** - Download path for movies (default: /downloads/movies/)
- **`RADARR_QBITTORRENT_URL`** - qBittorrent URL for Radarr (default: http://localhost:8080)
- **`RADARR_QBITTORRENT_USERNAME`** - qBittorrent username (default: admin)
- **`RADARR_QBITTORRENT_PASSWORD`** - qBittorrent password (default: admin)

### Lidarr Configuration

- **`LIDARR_URL`** - Lidarr API URL (default: http://localhost:8686)
- **`LIDARR_API_KEY`** - Lidarr API key
- **`LIDARR_DOWNLOAD_PATH`** - Download path for music (default: /downloads/music/)
- **`LIDARR_QBITTORRENT_URL`** - qBittorrent URL for Lidarr (default: http://localhost:8080)
- **`LIDARR_QBITTORRENT_USERNAME`** - qBittorrent username (default: admin)
- **`LIDARR_QBITTORRENT_PASSWORD`** - qBittorrent password (default: admin)

### Notification Configuration

- **`TELEGRAM_BOT_TOKEN`** - Telegram bot token (optional)
- **`TELEGRAM_CHAT_ID`** - Telegram chat ID (optional)
- **`DISCORD_URL`** - Discord webhook URL (optional)
- **`DISCORD_USERNAME`** - Discord username (default: "Helperr")

## Manual Operations

The following commands can be used to manually trigger specific operations:

### Combined Operations (Multiple Services)

```bash
# Check for missing movies, TV series, and music
docker exec helperr ./helperr missing

# Rename all movie, TV series, and music files
docker exec helperr ./helperr rename

# Relocate all movie, TV series, and music files
docker exec helperr ./helperr relocate

# Check notifications for both Telegram and Discord
docker exec helperr ./helperr check-notifications
```

### Sonarr (TV Series) Operations

```bash
# Check for missing TV series episodes
docker exec helperr ./helperr missing-series

# Rename TV series episodes
docker exec helperr ./helperr rename-series

# Relocate TV series episodes
docker exec helperr ./helperr relocate-series
```

### Radarr (Movies) Operations

```bash
# Check for missing movies
docker exec helperr ./helperr missing-movies

# Rename movie files
docker exec helperr ./helperr rename-movies

# Relocate movie files
docker exec helperr ./helperr relocate-movies
```

### Lidarr (Music) Operations

```bash
# Rename music files
docker exec helperr ./helperr rename-songs

# Relocate music files
docker exec helperr ./helperr relocate-songs
```

### Notification Operations

```bash
# Test Telegram notifications
docker exec helperr ./helperr check-telegram

# Test Discord notifications
docker exec helperr ./helperr check-discord
```

### Version Information

```bash
# Display current version
docker exec helperr ./helperr --version
```

## Features

### Torrent Relocation
- Automatically moves completed torrents to proper directory structure
- Maintains torrent seeding without breaking links
- Handles both single-file and multi-file torrents
- Intelligent season detection for TV shows (e.g., "Season 01")
- Artist-based directory organization for music

### File Renaming
- Renames files according to Sonarr/Radarr/Lidarr naming schemes
- Only runs when no active torrents exist
- Processes monitored items with existing files

### Missing Content Search
- Searches for missing episodes/movies that haven't been searched recently
- Respects `MISSING_FILES_SEARCH_INTERVAL` setting
- Only searches for monitored content

### Unwanted File Detection
- Automatically removes torrents containing unwanted extensions
- Configurable extension list (exe, rar, iso, etc.)
- Prevents malware/spam downloads

### Advanced Media Matching
- Binary search algorithm for efficient matching
- Handles alternate titles (important for anime/foreign content)
- Fuzzy matching with regex patterns
- Strips release group tags, quality info, years, etc.

### Notification System
- Real-time notifications via Telegram and/or Discord
- Logs all major operations (relocate, rename, errors)
- Test commands available for both services

## Version

Current version: **v2.1.4**

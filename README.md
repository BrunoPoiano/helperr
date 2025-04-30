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
In the same folder create a .env and a docker-compose.yaml

```bash
#.env
########## RADARR

RADARR_QBITTORRENT_URL="http://192.168.3.53:8080"
RADARR_QBITTORRENT_USERNAME=
RADARR_QBITTORRENT_PASSWORD=

RADARR_URL="http://192.168.3.53:7878"
RADARR_API_KEY=
RADARR_DOWNLOAD_PATH="/downloads/movies/"

########## SONARR

SONARR_QBITTORRENT_URL="http://192.168.3.29:8080"
SONARR_QBITTORRENT_USERNAME=
SONARR_QBITTORRENT_PASSWORD=

SONARR_URL="http://192.168.3.29:8989"
SONARR_API_KEY=
SONARR_DOWNLOAD_PATH="/downloads/shows/"

############### OPTIONAL

# How often to search again for missing files (in minutes)
# Default is 2880 (48 hours)
MISSING_FILES_SEARCH_INTERVAL=2880

######### TELEGRAM BOT
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

```yaml
#docker-compose.yaml
services:
  qbit-relocater:
    image: docker.io/brunopoiano/qbit-relocater
    environment:
      TZ: America/Sao_Paulo    # Set your timezone here
    env_file: .env
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

Create and configure your .env file:
```bash
cp .env.exemple .env
# Edit .env with your configuration
```

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

# Test Telegram bot connection
docker exec qbit-relocater npm run testBot

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

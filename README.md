# Qbit-relocater

Qbit-Relocater is a script that seamlessly integrates with Sonarr, Radarr, and qBittorrent to relocate torrents to the correct folders.

It ensures that files and folders are renamed and moved without breaking qBittorrent's links, eliminating the need for hardlinks or relying on Sonarr/Radarr to move or copy files. This allows for a cleaner, more efficient media management workflow.

## Actions

- every 10 minutes run a check for moving files
- once a day rename movie files
- once a day check for missing movies/series eps

## Before Deployment

- both radarr and sonnar should be at least **version 3+**
- In qBittorrent:
    - The `tv-sonarr` category should be set for Sonarr
    - The `radarr` category should be set for Radarr
- radar/sonar
    - `Completed Download Handling` must be `disabled`

*recomended settings*
- in qBittorrent check `Keep incomplete torrents in`
- in sonarr/radarr check `Rename Episodes`
- in radarr/sonnar qBittorrent settings set `Content Layout` as Original

## Deployment
You can find the Docker image here: [qbit-relocator image](https://hub.docker.com/r/brunopoiano/qbit-relocater)

### using image
in the same folder create a .env and a docker-compose.yaml
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

######### TELEGRAM BOT
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

```bash
#docker-compose.yaml
services:
  qbit-relocater:
    image: docker.io/brunopoiano/qbit-relocater
    env_file: .env
    restart: unless-stopped
    container_name: qbit-relocater
```

start the container
```bash
docker compose up -d
```

### using source code

```bash
git clone git@github.com:BrunoPoiano/qbit-relocater.git
cd qbit-relocater
```

.env
```bash
cp .env.exemple .env
```
 - Add the location of you sonarr and radarr server and their APIKeys
 - Add the location and credentials to your torrent server


Build the image
```bash
docker build -t qbit-relocater .
```

run the container
```bash
docker compose up -d
```

## Manual Operations

Run a manual scan movies
```bash
docker exec qbit-relocater npm run checkMovies
```
Run a manual scan series
```bash
docker exec qbit-relocater npm run checkSeries
```
Test telegram bot connection
```bash
docker exec qbit-relocater npm run testBot
```

Run a manual scan for missing movies
```bash
docker exec qbit-relocater npm run missingMovies
```
Run a manual scan for missing series eps
```bash
docker exec qbit-relocater npm run missingSeries
```

# Qbit-relocater

Qbit-relocater is a script that connects with sonarr, radarr and qBittorrent and redirects torrents to the right folder. 

It moves the torrent without qbittorent losing link and without the necessity of doing hardlinks or radarr/sonarr moving files 

## Before Deployment

- both radarr and sonnar should be version 3
- ensure that qBittorrent in sonnar has the `tv-sonarr` category
- ensure that qBittorrent in radarr has the `radarr` category

*recomended settings*
- in qBittorrent check `Keep incomplete torrents in`
- in sonarr/radarr check `Rename Episodes`
- in radarr/sonnar qBittorrent settings set `Content Layout` as Original

## Deployment

[qbit-relocator image](https://hub.docker.com/repository/docker/brunopoiano/qbit-relocater/general)

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

test/run a manual scan movies
```bash
docker exec qbit-relocater npm run checkMovies
```
test/run a manual scan series
```bash
docker exec qbit-relocater npm run checkSeries
```
test telegram bot connection
```bash
docker exec qbit-relocater npm run testBot
```

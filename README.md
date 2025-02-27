# Qbit-relocater

Qbit-relocater is a script that connects with sonarr, radarr and qBittorrent and redirects torrents to the right folder

## Before Deployment

- both radarr and sonnar should be version 3
- ensure that both sonarr and radarr has `Rename Episodes` checked
- ensure that qBittorrent in sonnar has the `tv-sonarr` category
- ensure that qBittorrent in radarr has the `radarr` category
- ensure that qBittorrent `Keep incomplete torrents in` is checked


## Deployment

### using image

```bash
#docker container
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

test/run a manual scan
Movies
```bash
docker exec qbit-relocater npm run checkMovies
```
Series
```bash
docker exec qbit-relocater npm run checkSeries
```

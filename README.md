

# Qbit-renamer

Qbit-renamer is a script that conects with sonarr, radarr and qBittorrent and redirects torrents to the right folder


## Before Deployment

- both radarr and sonnar should be version 3
- ensure that both sonarr and radarr has `Rename Episodes` checked
- ensure that qBittorrent in sonnar has the `tv-sonarr` category
- ensure that qBittorrent in radarr has the `radarr` category
- ensure that qBittorrent `Keep incomplete torrents in` is checked


## Deployment


```bash
git clone git@github.com:BrunoPoiano/qbit-renamer.git
cd qbit-renamer
```

.env

```bash
cp .env.exemple .env
```
 - Add the location of you sonarr and radarr server and their APIKeys
 - Add the location and credentials to your torrent server


Build the image

```bash
docker build -t qbit-renamer .
```

run the container

```bash
docker compose up -d
```

test/run a manual scan
```bash
docker exec qbit-renamer npm run changeTorrentLocation
```





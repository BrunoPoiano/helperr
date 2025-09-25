package radarr

import (
	qbittorrent "helperr/Services/QbitTorrent"
	"helperr/Services/utils"
	"helperr/types"
	"net/http"
)

var qbit = qbittorrent.QBittorrentClient(types.QBittorrentClient{
	BaseURL: utils.ReturnEnvVariable("RADARR_QBITTORRENT_URL", "http://localhost:8080"),
	Client:  &http.Client{},
	Cookie:  &http.Cookie{},
}).Login(utils.ReturnEnvVariable("RADARR_QBITTORRENT_USERNAME", "admin"), utils.ReturnEnvVariable("RADARR_QBITTORRENT_PASSWORD", "admin"))

var radarrClient = RadarrClient(types.RadarrClient{
	BaseURL:      utils.ReturnEnvVariable("RADARR_URL", "http://localhost:7878"),
	Key:          utils.ReturnEnvVariable("RADARR_API_KEY", ""),
	Client:       &http.Client{},
	DownloadPath: utils.ReturnEnvVariable("RADARR_DOWNLOAD_PATH", "/downloads/movies/"),
})

package sonarr

import (
	qbittorrent "helperr/Services/QbitTorrent"
	"helperr/Services/utils"
	"helperr/types"
	"net/http"
)

var qbit = qbittorrent.QBittorrentClient(types.QBittorrentClient{
	BaseURL: utils.ReturnEnvVariable("SONARR_QBITTORRENT_URL", "http://localhost:8080"),
	Client:  &http.Client{},
	Cookie:  &http.Cookie{},
}).Login(utils.ReturnEnvVariable("SONARR_QBITTORRENT_USERNAME", "admin"), utils.ReturnEnvVariable("SONARR_QBITTORRENT_PASSWORD", "admin"))

var sonarrClient = SonarrClient(types.SonarrClient{
	BaseURL:      utils.ReturnEnvVariable("SONARR_URL", "http://localhost:8989"),
	Key:          utils.ReturnEnvVariable("SONARR_API_KEY", ""),
	Client:       &http.Client{},
	DownloadPath: utils.ReturnEnvVariable("SONARR_DOWNLOAD_PATH", "/downloads/shows/"),
})

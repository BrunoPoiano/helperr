package lidarr

import (
	"net/http"

	qbittorrent "helperr/Services/QbitTorrent"
	"helperr/Services/utils"
	"helperr/types"
)

var qbit = qbittorrent.QBittorrentClient(types.QBittorrentClient{
	BaseURL: utils.ReturnEnvVariable("LIDARR_QBITTORRENT_URL", "http://localhosst:8080"),
	Client:  &http.Client{},
	Cookie:  &http.Cookie{},
}).Login(utils.ReturnEnvVariable("LIDARR_QBITTORRENT_USERNAME", "admin"), utils.ReturnEnvVariable("LIDARR_QBITTORRENT_PASSWORD", ""))

var lidarrClient = LidarrClient(types.LidarrClient{
	BaseURL:      utils.ReturnEnvVariable("LIDARR_URL", "http://localhosst:8686"),
	Key:          utils.ReturnEnvVariable("LIDARR_API_KEY", ""),
	Client:       &http.Client{},
	DownloadPath: utils.ReturnEnvVariable("LIDARR_DOWNLOAD_PATH", "/downloads/music/"),
})

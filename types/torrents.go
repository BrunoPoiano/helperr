package types

import (
	"net/http"
)

type QBittorrentClient struct {
	BaseURL string
	Client  *http.Client
	Cookie  *http.Cookie
}

type Torrent struct {
	Hash        string `json:"hash"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	SavePath    string `json:"save_path"`
	ContentPath string `json:"content_path"`
}

type TorrentContent struct {
	Index int    `json:"index"`
	Name  string `json:"name"`
	Size  int    `json:"size"`
}

type Index string

const (
	Radarr Index = "radarr"
	Sonarr Index = "sonarr"
	Lidarr Index = "lidarr"
)

func (i Index) IsValid() bool {
	switch i {
	case Radarr, Sonarr, Lidarr:
		return true
	default:
		return false
	}
}

type Filter struct {
	Category Index
	Path     string
}

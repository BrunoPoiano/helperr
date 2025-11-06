package types

import "net/http"

func (m Groups) GetTitle() string {
	return m.ArtistName
}

func (m Groups) GetSortTitle() string {
	return m.SortName
}

func (m Groups) GetAlternateTitles() []AlternateTitle {
	var alternateTitle []AlternateTitle
	return alternateTitle
}

type LidarrClient struct {
	BaseURL      string
	Key          string
	Client       *http.Client
	DownloadPath string
}

type GroupStatistic struct {
	AlbumCount      int `json:"albumCount"`
	TrackFileCount  int `json:"trackFileCount"`
	TrackCount      int `json:"trackCount"`
	TotalTrackCount int `json:"totalTrackCount"`
	SizeOnDisk      int `json:"sizeOnDisk"`
}

type Groups struct {
	Id         int            `json:"id"`
	ArtistName string         `json:"artistName"`
	Path       string         `json:"path"`
	SortName   string         `json:"sortName"`
	Monitored  bool           `json:"monitored"`
	Statistics GroupStatistic `json:"statistics"`
}

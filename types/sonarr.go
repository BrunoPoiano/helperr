package types

import "net/http"

func (m Serie) GetTitle() string {
	return m.Title
}

func (m Serie) GetSortTitle() string {
	return m.SortTitle
}

func (m Serie) GetAlternateTitles() []AlternateTitle {
	return m.AlternateTitles
}

type SonarrClient struct {
	BaseURL      string
	Key          string
	Client       *http.Client
	DownloadPath string
}

type StatisticsSerie struct {
	EpisodeFileCount int `json:"episodeFileCount"`
}

type Serie struct {
	Id              int              `json:"id"`
	Title           string           `json:"title"`
	SortTitle       string           `json:"sortTitle"`
	Path            string           `json:"path"`
	AlternateTitles []AlternateTitle `json:"alternateTitles"`
	Monitored       bool             `json:"monitored"`
	Statistics      StatisticsSerie  `json:"statistics"`
}

type MissingSeries struct {
	Records []struct {
		SeriesId       int    `json:"seriesId"`
		AirDate        string `json:"airDate"`
		AirDateUtc     string `json:"airDateUtc"`
		LastSearchTime string `json:"lastSearchTime"`
		Id             int    `json:"id"`
	} `json:"records"`
}

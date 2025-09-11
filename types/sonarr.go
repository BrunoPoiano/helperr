package types

import "net/http"

func (m Serie) GetTitle() string {
	return m.Title
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
	Id              int
	Title           string
	Path            string
	AlternateTitles []AlternateTitle
	Monitored       bool
	Statistics      StatisticsSerie
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

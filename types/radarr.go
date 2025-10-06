package types

import "net/http"

func (m Movie) GetTitle() string {
	return m.Title
}

func (m Movie) GetSortTitle() string {
	return m.SortTitle
}

func (m Movie) GetAlternateTitles() []AlternateTitle {
	return m.AlternateTitles
}

type RadarrClient struct {
	BaseURL      string
	Key          string
	Client       *http.Client
	DownloadPath string
}

type MovieFile struct {
	Path         string `json:"path"`
	RelativePath string `json:"relativePath"`
}

type StatisticsMovie struct {
	MovieFileCount int `json:"movieFileCount"`
}

type Movie struct {
	Id              int              `json:"id"`
	Title           string           `json:"title"`
	Path            string           `json:"path"`
	SortTitle       string           `json:"sortTitle"`
	MovieFileId     int              `json:"movieFileId"`
	MovieFile       MovieFile        `json:"movieFile"`
	AlternateTitles []AlternateTitle `json:"alternateTitles"`
	Monitored       bool             `json:"monitored"`
	Statistics      StatisticsMovie  `json:"statistics"`
}

type MissingMovie struct {
	Records []struct {
		Title          string `json:"title"`
		SeriesId       int    `json:"seriesId"`
		LastSearchTime string `json:"lastSearchTime"`
		Id             int    `json:"id"`
	} `json:"records"`
}

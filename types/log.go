package types

type LogType string

const (
	LogTypeMovie   LogType = "movie"
	LogTypeSerie   LogType = "serie"
	LogTypeTorrent LogType = "torrent"
)

func (t LogType) IsValid() bool {
	switch t {
	case LogTypeMovie, LogTypeSerie, LogTypeTorrent:
		return true
	default:
		return false
	}
}

func (t LogType) ToString() string {
	return string(t)
}

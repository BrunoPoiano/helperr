package types

type LogType string

const (
	LogTypeMovie   LogType = "movie"
	LogTypeSerie   LogType = "serie"
	LogTypeTorrent LogType = "torrent"
	LogTypeMusic   LogType = "music"
)

func (t LogType) IsValid() bool {
	switch t {
	case LogTypeMovie, LogTypeSerie, LogTypeTorrent, LogTypeMusic:
		return true
	default:
		return false
	}
}

func (t LogType) ToString() string {
	return string(t)
}

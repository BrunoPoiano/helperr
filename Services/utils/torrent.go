package utils

import "helperr/types"

func FilteredTorrentList(torrentsList []types.Torrent) []types.Torrent {

	var torrents []types.Torrent

	for _, item := range torrentsList {
		sonarr := item.Category == "tv-sonarr" && item.SavePath == "/downloads/tv-sonarr"
		radarr := item.Category == "radarr" && item.SavePath == "/downloads/radarr"

		if sonarr || radarr {
			torrents = append(torrents, item)
		}
	}

	return torrents
}

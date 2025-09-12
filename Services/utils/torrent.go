package utils

import "helperr/types"

// FilteredTorrentList filters a list of torrents based on category and save path.
// Parameters:
//   - torrentsList: A slice of Torrent structs to filter.
//
// Returns:
//   - A slice of Torrent structs that match the filter criteria.
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

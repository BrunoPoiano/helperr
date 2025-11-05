package utils

import "helperr/types"

// FilteredTorrentList filters a list of torrents based on category and save path.
// Parameters:
//   - torrentsList: A slice of Torrent structs to filter.
//
// Returns:
//   - A slice of Torrent structs that match the filter criteria.
func FilteredTorrentList(torrentsList []types.Torrent, filter types.Filter) []types.Torrent {
	var torrents []types.Torrent

	if !filter.Category.IsValid() {
		return torrents
	}

	println(filter.Category, filter.Path)

	for _, item := range torrentsList {

		if item.Category != string(filter.Category) {
			continue
		}

		if filter.Path != "" && item.SavePath != string(filter.Path) {
			continue
		}

		torrents = append(torrents, item)
	}

	return torrents
}

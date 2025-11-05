package lidarr

import (
	logs "helperr/Services/Logs"
	"helperr/types"
)

// Rename triggers a rename command in Radarr for movies that meet certain criteria.
//
// Parameters:
//   - None
//
// Returns:
//   - None
func Rename() {
	logs.TimeLogs("music", false, "Running rename", true)
	torrents, error := qbit.List(types.Filter{
		Category: "lidarr",
		Path:     "",
	})

	if error != nil {
		logs.TimeLogs("music", true, "Getting Torrent list", false)
		return
	}
	if len(torrents) > 0 {
		logs.TimeLogs("music", false, "Can't update songs with torrent active", false)
		return
	}

	groups, error := lidarrClient.List()
	if error != nil {
		logs.TimeLogs("music", true, "Getting artists List", false)
		return
	}

	var artistsIds []int

	for _, group := range groups {

		if group.Statistics.TrackFileCount == 0 {
			continue
		}

		if !group.Monitored {
			continue
		}

		println(group.ArtistName, group.Id)
		artistsIds = append(artistsIds, group.Id)
	}

	if len(artistsIds) == 0 {
		logs.TimeLogs("music", false, "No songs to rename", true)
		return
	}

	error = lidarrClient.LidarrCommand("RenameArtist", artistsIds)
	if error != nil {
		logs.TimeLogs("music", true, "Renaming Songs", true)
		return
	}
}

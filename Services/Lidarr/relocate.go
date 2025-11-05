package lidarr

import (
	"fmt"
	"strings"

	logs "helperr/Services/Logs"
	"helperr/Services/utils"
	"helperr/types"
)

// Relocate checks for new series files in the torrent client and updates their location.
// Parameters:
//   - None
//
// Returns:
//   - None
func Relocate() {
	logs.TimeLogs("music", false, "running new albuns check", false)

	torrents, error := qbit.List(types.Filter{
		Category: "lidarr",
		Path:     "/downloads/lidarr",
	})
	if error != nil {
		logs.TimeLogs("music", true, "Error listing Torrents", false)
		return
	}
	if len(torrents) == 0 {
		logs.TimeLogs("music", false, "No new albuns to update", false)
		return
	}

	groups, error := lidarrClient.List()
	if error != nil {
		logs.TimeLogs("music", true, "getting albuns list", false)
		return
	}

	for _, torrent := range torrents {
		torrentName := utils.PrepareComparisonString(torrent.Name)
		group, error := utils.MediaBinarySearch(groups, torrentName)
		if error != nil {
			log := fmt.Sprintf("Error searching for albuns: %s | %s", torrent.Name, torrentName)
			logs.TimeLogs("music", true, log, true)
			continue
		}
		println(torrentName, " | ", torrent.Name, " | ", group.ArtistName)
		updateTorrent(group, torrent)
	}
}

// updateTorrent updates the location of a torrent based on the series and torrent information.
// Parameters:
//   - serie: The series information.
//   - torrent: The torrent information.
//
// Returns:
//   - None
func updateTorrent(group *types.Groups, torrent types.Torrent) {
	// Log the start of the update process
	log := fmt.Sprintf("Running update on: %s", torrent.Name)
	logs.TimeLogs("music", false, log, true)

	downloadPath := lidarrClient.DownloadPath

	// Extract the groups name from the path
	split := strings.Split(group.Path, "/")
	groupsName := split[len(split)-1]

	// Construct the base path and season-specific path
	groupPath := downloadPath + groupsName

	println(groupPath)
	// For single-file torrents, move directly to the season-specific path
	error := qbit.RelocateTorrent(torrent.Hash, groupPath)
	if error != nil {
		log := fmt.Sprintf("error changing the location: %s", group.ArtistName)
		logs.TimeLogs("music", true, log, false)
		return
	}

	log = fmt.Sprintf("A new %s album was moved to %s", group.ArtistName, groupPath)
	logs.TimeLogs("music", false, log, true)
}

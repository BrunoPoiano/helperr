package lidarr

import (
	"fmt"
	"strings"

	logs "helperr/Services/Logs"
	"helperr/Services/utils"
	"helperr/types"
)

// Relocate checks for new album files in the torrent client and updates their location.
// It searches for torrents in the lidarr category, matches them with albums from Lidarr,
// and relocates them to the appropriate artist directory.
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
		updateTorrent(group, torrent)
	}
}

// updateTorrent updates the location of a torrent based on the album and torrent information.
// It extracts the artist directory name from the group path and relocates the torrent
// to the appropriate location within the Lidarr download directory.
// Parameters:
//   - group: The album/artist group information from Lidarr.
//   - torrent: The torrent information from the torrent client.
//
// Returns:
//   - None
func updateTorrent(group *types.Groups, torrent types.Torrent) {
	// Log the start of the update process
	log := fmt.Sprintf("Running update on: %s", torrent.Name)
	logs.TimeLogs("music", false, log, true)

	downloadPath := lidarrClient.DownloadPath

	// Extract the artist directory name from the path
	split := strings.Split(group.Path, "/")
	groupsName := split[len(split)-1]

	// Construct the full path to the artist directory
	groupPath := downloadPath + groupsName

	// Relocate the torrent to the artist directory
	error := qbit.RelocateTorrent(torrent.Hash, groupPath)
	if error != nil {
		log := fmt.Sprintf("error changing the location: %s", group.ArtistName)
		logs.TimeLogs("music", true, log, false)
		return
	}

	log = fmt.Sprintf("A new %s album was moved to %s", group.ArtistName, groupPath)
	logs.TimeLogs("music", false, log, true)
}

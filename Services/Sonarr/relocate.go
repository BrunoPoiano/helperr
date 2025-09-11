package sonarr

import (
	"fmt"
	logs "helperr/Services/Logs"
	"helperr/Services/utils"
	"helperr/types"
	"strings"
)

func Relocate() {

	logs.TimeLogs("serie", false, "running series check", true)

	torrents, error := qbit.List()
	if error != nil {
		logs.TimeLogs("serie", true, "Error listing Torrents", false)
	}
	if len(torrents) == 0 {
		logs.TimeLogs("serie", false, "No new series files to update", false)
	}

	series, error := sonarrClient.List()
	if error != nil {
		logs.TimeLogs("serie", true, "getting series list", false)
	}

	for _, torrent := range torrents {
		torrentName := utils.PrepareComparisonString(torrent.Name)
		serie, error := utils.MediaBinarySearch(series, torrentName)
		if error != nil {
			log := fmt.Sprintf("Error searching for series: %s", torrent.Name)
			logs.TimeLogs("serie", true, log, false)
			continue
		}
		updateTorrent(serie, torrent)
	}
}

func updateTorrent(serie *types.Serie, torrent types.Torrent) {
	// Log the start of the update process
	log := fmt.Sprintf("Running update on: %s", torrent.Name)
	logs.TimeLogs("serie", false, log, true)

	downloadPath := sonarrClient.DownloadPath

	// Extract the series name from the path
	split := strings.Split(serie.Path, "/")
	seriesName := split[len(split)-1]

	// Get the season information from the torrent name
	season := utils.SeriesSeason(torrent.Name)

	// Construct the base path and season-specific path
	basePath := downloadPath + seriesName
	seasonPath := downloadPath + seriesName + "/" + season

	// Retrieve the files contained in the torrent
	torrentContents, error := qbit.TorrentsContents(torrent.Hash)
	if error != nil {
		logs.TimeLogs("serie", true, "getting torrent contents", false)
		return
	}

	// Handle multi-file torrents differently than single-file torrents
	if len(torrentContents) > 1 {
		// For multi-file torrents, we need to rename the folder and move it
		oldPath := strings.Split(torrent.ContentPath, "/")
		fileSeason := utils.SeriesSeason(oldPath[len(oldPath)-1])

		// Rename the folder to match the season format
		error := qbit.RenameFolder(torrent.Hash, oldPath[len(oldPath)-1], fileSeason)
		if error != nil {
			log = fmt.Sprintf("Error renaming folder: %s", serie.Title)
			logs.TimeLogs("serie", true, log, false)
			return
		}

		// Move the torrent to the base path for the series
		error = qbit.RelocateTorrent(torrent.Hash, basePath)
		if error != nil {
			log := fmt.Sprintf("error changing the location: %s", serie.Title)
			logs.TimeLogs("serie", true, log, false)
			return
		}
	} else {
		// For single-file torrents, move directly to the season-specific path
		error = qbit.RelocateTorrent(torrent.Hash, seasonPath)
		if error != nil {
			log := fmt.Sprintf("error changing the location: %s", serie.Title)
			logs.TimeLogs("serie", true, log, false)
			return
		}
	}

	log = fmt.Sprintf("A new %s episode was moved to %s", serie.Title, seasonPath)
	logs.TimeLogs("serie", false, log, true)
}

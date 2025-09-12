package radarr

import (
	"fmt"
	logs "helperr/Services/Logs"
	"helperr/Services/utils"
	"helperr/types"
	"strings"
)

// Relocate checks for movies to relocate and calls updateTorrent for each.
//
// Parameters:
//   - None
//
// Returns:
//   - None
func Relocate() {
	logs.TimeLogs("movie", false, "Running Relocate Movies Check", false)

	torrents, error := qbit.List()
	if error != nil {
		logs.TimeLogs("movie", true, fmt.Sprintf("getting torrent list | %s", error.Error()), false)
		return
	}

	if len(torrents) == 0 {
		logs.TimeLogs("movie", false, "No New Movies Files to Relocate", false)
		return
	}

	movies, error := radarrClient.List()
	if error != nil {
		logs.TimeLogs("movie", true, fmt.Sprintf("Movies List | %s", error.Error()), false)
		return
	}

	for _, torrent := range torrents {
		torrentName := utils.PrepareComparisonString(torrent.Name)
		movie, error := utils.MediaBinarySearch(movies, torrentName)
		if error != nil {
			logs.TimeLogs("movie", true, fmt.Sprintf("No Match Found for: %s", movie.Title), true)
			continue
		}
		updateTorrent(movie, torrent)
	}
}

// updateTorrent renames and relocates a torrent based on movie information.
//
// Parameters:
//   - movie: The movie object.
//   - torrent: The torrent object.
//
// Returns:
//   - None
func updateTorrent(movie *types.Movie, torrent types.Torrent) {
	logs.TimeLogs("movie", false, fmt.Sprintf(`Running update on %s`, movie.Title), true)

	oldPath := strings.Split(torrent.ContentPath, "/")
	movieSplit := strings.Split(movie.Path, "/")
	movieName := movieSplit[len(movieSplit)-1]

	// Define base and full paths for the download
	fullPath := radarrClient.DownloadPath + movieName

	TorrentContents, error := qbit.TorrentsContents(torrent.Hash)
	if error != nil {
		logs.TimeLogs("movie", true, "Getting Torrent List", false)
		return
	}

	// Handle torrents with multiple files (folders)
	if len(TorrentContents) > 1 {
		// Get the current folder name from the torrent path
		oldFolderName := oldPath[len(oldPath)-1]

		// Rename the folder if it doesn't match the movie name
		if oldFolderName != movieName {
			error := qbit.RenameFolder(torrent.Hash, oldFolderName, movieName)
			if error != nil {
				logs.TimeLogs("movie", true, fmt.Sprintf("Renaming Folder | %s", movie.Title), true)
				return
			}
		}

		//   // Iterate through files in the folder and rename them
		for _, file := range TorrentContents {
			extention := strings.Split(file.Name, ".")[1]
			oldFilePath := strings.Split(file.Name, "/")
			newFileName := fmt.Sprintf("%s.%s", movieName, extention)

			if utils.VideoExtensions[extention] && oldFilePath[1] != newFileName {
				error := qbit.RenameFile(
					torrent.Hash,
					fmt.Sprintf("%s/%s", movieName, oldFilePath[1]),
					fmt.Sprintf("%s/%s", movieName, newFileName),
				)
				if error != nil {
					logs.TimeLogs("movie", true, fmt.Sprintf("Renaming File %s | %s", oldFilePath[1], movie.Title), true)
					continue
				}
			}
		}

		// Move the torrent to the base path if it's not already there
		if torrent.ContentPath != radarrClient.DownloadPath {
			error := qbit.RelocateTorrent(torrent.Hash, radarrClient.DownloadPath)
			if error != nil {
				logs.TimeLogs("movie", true, fmt.Sprintf("Changing Location | %s", movie.Title), true)
				return
			}
		}
	} else {
		// Handle single file torrents
		oldFileName := oldPath[len(oldPath)-1]

		// Rename the file if it doesn't match the movie name
		if oldFileName != movieName {
			error := qbit.RenameFile(torrent.Hash, oldFileName, movieName)
			if error != nil {
				logs.TimeLogs("movie", true, fmt.Sprintf("Renaming File %s | %s", oldFileName, movie.Title), true)
				return
			}
		}

		// Move the torrent to the full path if it's not already there
		if torrent.ContentPath != fullPath {
			error := qbit.RelocateTorrent(torrent.Hash, fullPath)
			if error != nil {
				logs.TimeLogs("movie", true, fmt.Sprintf("Changing Location | %s", movie.Title), true)
				return
			}
		}
	}
	logs.TimeLogs("movie", false, fmt.Sprintf(`
		torrent name: %s
				movie title: %s
				radarr location: %s
				torrent location: %s`, torrent.Name, movie.Title, movie.Path, fullPath),
		true,
	)
}

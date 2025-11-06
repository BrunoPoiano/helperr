package radarr

import (
	logs "helperr/Services/Logs"
	"helperr/Services/utils"
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
	logs.TimeLogs("movie", false, "Running rename Movies", true)

	torrents, error := qbit.List(types.Filter{
		Category: "radarr",
		Path:     "/downloads/radarr",
	})
	if error != nil {
		logs.TimeLogs("movie", true, "Getting Torrent list", false)
		return
	}
	if len(torrents) > 0 {
		logs.TimeLogs("movie", false, "Can't update movies with torrent active", false)
		return
	}

	movies, error := radarrClient.List()
	if error != nil {
		logs.TimeLogs("movie", true, "Getting Movies List", false)
		return
	}

	var moviesIds []int

	for _, movie := range movies {

		if movie.MovieFile.Path == "" {
			continue
		}

		if utils.HasImdbidTags(movie.MovieFile.Path) {
			continue
		}

		if movie.Statistics.MovieFileCount == 0 {
			continue
		}

		if !movie.Monitored {
			continue
		}

		moviesIds = append(moviesIds, movie.Id)
	}

	if len(moviesIds) == 0 {
		logs.TimeLogs("movie", false, "No movies to rename", true)
		return
	}

	error = radarrClient.RadarrCommand("RenameMovie", moviesIds)
	if error != nil {
		logs.TimeLogs("movie", true, "Renaming Movies", true)
		return
	}
}

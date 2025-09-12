package radarr

import logs "helperr/Services/Logs"

func Missing() {
	logs.TimeLogs("movie", false, "Running Missing Movies Check", true)

	moviesIds, error := radarrClient.MissingMovies()
	if error != nil {
		logs.TimeLogs("movie", true, "Running Missing Movies Check", true)
		return
	}

	if len(moviesIds) == 0 {
		logs.TimeLogs("movie", false, "No Missing Movies to Search", true)
		return
	}

	error = radarrClient.RadarrCommand("MoviesSearch", moviesIds)
	if error != nil {
		logs.TimeLogs("movie", true, "Searching Missing Movies", true)
		return
	}
	logs.TimeLogs("movie", false, "Finished Searching Missing Movies", true)
}

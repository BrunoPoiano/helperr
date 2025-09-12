package sonarr

import logs "helperr/Services/Logs"

// Missing checks for missing episodes and triggers a search in Sonarr.
// Parameters:
//   - None
//
// Returns:
//   - None
func Missing() {
	logs.TimeLogs("serie", false, "Running Missing Eps Check", true)

	epsIds, error := sonarrClient.MissingEpsList()
	if error != nil {
		logs.TimeLogs("serie", true, "Running Missing Eps Check", true)
		return
	}

	if len(epsIds) == 0 {
		logs.TimeLogs("serie", false, "No Missing Eps to Search", true)
		return
	}

	error = sonarrClient.SonarrCommand("EpisodeSearch", "episodeIds", epsIds)
	if error != nil {
		logs.TimeLogs("serie", true, "Searching Missing Eps", true)
		return
	}
	logs.TimeLogs("serie", false, "Finished Searching Missing Eps", true)
}

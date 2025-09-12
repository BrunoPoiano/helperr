package sonarr

import logs "helperr/Services/Logs"

func Rename() {
	logs.TimeLogs("serie", false, "Running rename series eps", true)
	torrents, error := qbit.List()
	if error != nil {
		logs.TimeLogs("serie", true, "Getting Torrent list", false)
		return
	}
	if len(torrents) > 0 {
		logs.TimeLogs("serie", false, "Can't update series with torrents active", true)
		return
	}

	series, error := sonarrClient.List()
	if error != nil {
		logs.TimeLogs("serie", true, "Getting Series list", false)
		return
	}

	var seriesIds []int

	for _, serie := range series {
		if serie.Monitored && serie.Statistics.EpisodeFileCount > 0 {
			seriesIds = append(seriesIds, serie.Id)
		}
	}

	if len(seriesIds) == 0 {
		logs.TimeLogs("movie", false, "No series eps to rename", true)
		return
	}

	error = sonarrClient.SonarrCommand("RenameSeries", "seriesIds", seriesIds)
	if error != nil {
		logs.TimeLogs("serie", true, "Running rename series eps", false)
		return
	}
}

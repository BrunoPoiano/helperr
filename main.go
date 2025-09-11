package main

import (
	logs "helperr/Services/Logs"
	radarr "helperr/Services/Radarr"
	sonarr "helperr/Services/Sonarr"
	"os"
)

func main() {
	args := os.Args[1:]

	switch args[0] {
	case "missing":
		sonarr.Missing()
		radarr.Missing()
		break
	case "rename":
		sonarr.Rename()
		radarr.Rename()
		break
	case "relocate":
		sonarr.Relocate()
		radarr.Relocate()
		break

	case "missing-series":
		sonarr.Relocate()
		break
	case "missing-movies":
		radarr.Relocate()
		break

	case "rename-series":
		sonarr.Rename()
		break
	case "rename-movies":
		radarr.Rename()
		break

	case "relocate-series":
		sonarr.Relocate()
		break
	case "relocate-movies":
		radarr.Relocate()
		break

	case "check-notifications":
		logs.CheckDiscord()
		logs.CheckTelegram()
		break
	case "check-telegram":
		logs.CheckTelegram()
		break
	case "check-discord":
		logs.CheckDiscord()
		break

	}

}

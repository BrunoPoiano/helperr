package main

import (
	logs "helperr/Services/Logs"
	radarr "helperr/Services/Radarr"
	sonarr "helperr/Services/Sonarr"
	"os"
	"sync"
)

func main() {
	args := os.Args[1:]

	var wg sync.WaitGroup
	switch args[0] {
	case "missing":
		wg.Add(2)
		go func() {
			sonarr.Missing()
			defer wg.Done()
		}()
		go func() {
			radarr.Missing()
			defer wg.Done()
		}()
		break
	case "rename":
		wg.Add(2)
		go func() {
			sonarr.Rename()
			defer wg.Done()
		}()
		go func() {
			radarr.Rename()
			defer wg.Done()
		}()
		break
	case "relocate":
		wg.Add(2)
		go func() {
			sonarr.Relocate()
			defer wg.Done()
		}()
		go func() {
			radarr.Relocate()
			defer wg.Done()
		}()
		break
	case "check-notifications":
		wg.Add(2)
		go func() {
			logs.CheckDiscord()
			defer wg.Done()
		}()
		go func() {
			logs.CheckTelegram()
			defer wg.Done()
		}()
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

	case "check-telegram":
		logs.CheckTelegram()
		break
	case "check-discord":
		logs.CheckDiscord()
		break
	}

	wg.Wait()
}

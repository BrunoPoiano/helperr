package sonarr

import (
	"bytes"
	"encoding/json"
	config "helperr/Services/Config"
	"helperr/Services/utils"
	"helperr/types"
	"io"
	"net/http"
)

type sonarrWrapper struct{ types.SonarrClient }

// SonarrClient creates a new Sonarr client wrapper.
// Parameters:
//   - values: Sonarr client configuration values.
//
// Returns:
//   - *sonarrWrapper: A pointer to the new Sonarr client wrapper.
func SonarrClient(values types.SonarrClient) *sonarrWrapper {
	return &sonarrWrapper{values}
}

// sonarrRequest makes a request to the Sonarr API.
// Parameters:
//   - method: HTTP method (GET, POST, etc.).
//   - url: API endpoint URL.
//   - body: Request body (io.Reader).
//
// Returns:
//   - []byte: Response body as a byte slice.
//   - error: An error if the request fails.
func (sonarr *sonarrWrapper) sonarrRequest(method, url string, body io.Reader) ([]byte, error) {

	request, error := http.NewRequest(method, sonarr.BaseURL+url, body)
	if error != nil {
		return nil, error
	}
	request.Header.Set("X-api-key", sonarr.Key)
	request.Header.Set("Content-Type", "application/json; charset=utf-8")
	response, error := sonarr.Client.Do(request)
	if error != nil {
		return nil, error
	}

	responseBody, error := io.ReadAll(response.Body)
	if error != nil {
		return nil, error
	}
	defer response.Body.Close()

	return responseBody, nil
}

// List retrieves a list of series from Sonarr.
// Parameters:
//   - None
//
// Returns:
//   - []types.Serie: A slice of Serie structs.
//   - error: An error if the request or unmarshaling fails.
func (sonarr *sonarrWrapper) List() ([]types.Serie, error) {

	var series []types.Serie

	body, err := sonarr.sonarrRequest("GET", "/api/v3/series", nil)
	if err != nil {
		return series, err
	}
	err = json.Unmarshal(body, &series)
	if err != nil {
		return series, err
	}

	return series, nil
}

// SonarrCommand sends a command to Sonarr.
// Parameters:
//   - command: The command to execute.
//   - typeCommand: The type of command (e.g., "seriesIds").
//   - seriesIds: A slice of series IDs to apply the command to.
//
// Returns:
//   - error: An error if the request fails.
func (sonarr *sonarrWrapper) SonarrCommand(command, typeCommand string, seriesIds []int) error {

	data := map[string]interface{}{
		"name":      command,
		typeCommand: seriesIds,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	_, err = sonarr.sonarrRequest("POST", "/api/v3/command", bytes.NewBuffer(jsonData))
	return err
}

// MissingEpsList retrieves a list of missing episode IDs from Sonarr.
// Parameters:
//   - None
//
// Returns:
//   - []int: A slice of missing episode IDs.
//   - error: An error if the request or unmarshaling fails.
func (sonarr *sonarrWrapper) MissingEpsList() ([]int, error) {
	minutesSinceLastSearch := config.Env.MissingFilesSearchInternal | 5760

	var epsIds []int
	var missingSeries types.MissingSeries
	body, error := sonarrClient.sonarrRequest("GET", "/api/v3/wanted/missing?page=1&pageSize=1000&sortDirection=descending&sortKey=episodes.airDateUtc&monitored=true", nil)
	if error != nil {
		return epsIds, error
	}

	error = json.Unmarshal(body, &missingSeries)
	if error != nil {
		return epsIds, error
	}

	for _, item := range missingSeries.Records {
		lastSearch, err := utils.MinutesSinceLastSearch(item.LastSearchTime)
		if err != nil {
			continue
		}

		if item.AirDate != "" && lastSearch > minutesSinceLastSearch {
			epsIds = append(epsIds, item.Id)
		}
	}

	return epsIds, nil
}

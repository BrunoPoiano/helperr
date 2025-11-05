package lidarr

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"helperr/types"
)

type lidarrWrapper struct {
	types.LidarrClient
}

// GetTitle retrieves the title of a movie.
// Parameters:
//   - m: The movie object.
//
// Returns:
//   - The title of the movie.
func GetTitle(m types.Groups) string {
	return m.ArtistName
}

// GetAlternateTitles retrieves the alternate titles of a movie.
// Parameters:
//   - m: The movie object.
//
// Returns:
//   - A slice of alternate titles for the movie.
func GetAlternateTitles(m types.Groups) []types.AlternateTitle {
	var alternateTitle []types.AlternateTitle
	return alternateTitle
}

// RadarrClient creates a new Radarr client wrapper.
// Parameters:
//   - values: The Radarr client configuration values.
//
// Returns:
//   - A pointer to the Radarr client wrapper.
func LidarrClient(values types.LidarrClient) *lidarrWrapper {
	return &lidarrWrapper{values}
}

// lidarrRequest makes a request to the Radarr API.
// Parameters:
//   - method: The HTTP method to use (e.g., "GET", "POST").
//   - url: The API endpoint URL.
//   - body: The request body (if any).
//
// Returns:
//   - The response body as a byte slice.
//   - An error if the request fails.
func (lidarr *lidarrWrapper) lidarrRequest(method, url string, body io.Reader) ([]byte, error) {
	request, error := http.NewRequest(method, lidarr.BaseURL+url, body)
	if error != nil {
		return nil, error
	}
	request.Header.Set("X-api-key", lidarr.Key)
	request.Header.Set("Content-Type", "application/json; charset=utf-8")
	response, error := lidarr.Client.Do(request)
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

// List retrieves a list of movies from Radarr.
// Parameters:
//   - None
//
// Returns:
//   - A slice of Movie objects.
//   - An error if the request fails.
func (lidarr *lidarrWrapper) List() ([]types.Groups, error) {
	var groups []types.Groups

	body, err := lidarr.lidarrRequest("GET", "/api/v1/artist", nil)
	if err != nil {
		return groups, err
	}
	err = json.Unmarshal(body, &groups)
	if err != nil {
		return groups, err
	}

	return groups, nil
}

// LidarrCommand sends a command to Radarr.
// Parameters:
//   - command: The command to execute.
//   - movesIds: A slice of movie IDs to apply the command to.
//
// Returns:
//   - An error if the request fails.
func (lidarr *lidarrWrapper) LidarrCommand(command string, artistIds []int) error {
	data := map[string]interface{}{
		"name":      command,
		"artistIds": artistIds,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	_, err = lidarr.lidarrRequest("POST", "/api/v1/command", bytes.NewBuffer(jsonData))
	return err
}

package radarr

import (
	"bytes"
	"encoding/json"
	config "helperr/Services/Config"
	"helperr/Services/utils"
	"helperr/types"
	"io"
	"net/http"
)

type radarrWrapper struct {
	types.RadarrClient
}

// GetTitle retrieves the title of a movie.
// Parameters:
//   - m: The movie object.
//
// Returns:
//   - The title of the movie.
func GetTitle(m types.Movie) string {
	return m.Title
}

// GetAlternateTitles retrieves the alternate titles of a movie.
// Parameters:
//   - m: The movie object.
//
// Returns:
//   - A slice of alternate titles for the movie.
func GetAlternateTitles(m types.Movie) []types.AlternateTitle {
	return m.AlternateTitles
}

// RadarrClient creates a new Radarr client wrapper.
// Parameters:
//   - values: The Radarr client configuration values.
//
// Returns:
//   - A pointer to the Radarr client wrapper.
func RadarrClient(values types.RadarrClient) *radarrWrapper {
	return &radarrWrapper{values}
}

// radarrRequest makes a request to the Radarr API.
// Parameters:
//   - method: The HTTP method to use (e.g., "GET", "POST").
//   - url: The API endpoint URL.
//   - body: The request body (if any).
//
// Returns:
//   - The response body as a byte slice.
//   - An error if the request fails.
func (radarr *radarrWrapper) radarrRequest(method, url string, body io.Reader) ([]byte, error) {

	request, error := http.NewRequest(method, radarr.BaseURL+url, body)
	if error != nil {
		return nil, error
	}
	request.Header.Set("X-api-key", radarr.Key)
	request.Header.Set("Content-Type", "application/json; charset=utf-8")
	response, error := radarr.Client.Do(request)
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
func (radarr *radarrWrapper) List() ([]types.Movie, error) {

	var movies []types.Movie

	body, err := radarr.radarrRequest("GET", "/api/v3/movie", nil)
	if err != nil {
		return movies, err
	}
	err = json.Unmarshal(body, &movies)
	if err != nil {
		return movies, err
	}

	return movies, nil
}

// RadarrCommand sends a command to Radarr.
// Parameters:
//   - command: The command to execute.
//   - movesIds: A slice of movie IDs to apply the command to.
//
// Returns:
//   - An error if the request fails.
func (radarr *radarrWrapper) RadarrCommand(command string, movesIds []int) error {

	data := map[string]interface{}{
		"name":     command,
		"movieIds": movesIds,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	_, err = radarr.radarrRequest("POST", "/api/v3/command", bytes.NewBuffer(jsonData))
	return err
}

// MissingMovies retrieves a list of missing movie IDs from Radarr.
// Parameters:
//   - None
//
// Returns:
//   - A slice of movie IDs that are missing.
//   - An error if the request fails.
func (radarr *radarrWrapper) MissingMovies() ([]int, error) {
	minutesSinceLastSearch := config.Env.MissingFilesSearchInternal | 5760

	var missing types.MissingMovie
	var moviesIds []int

	body, err := radarr.radarrRequest("GET", "/api/v3/wanted/missing?page=1&pageSize=1000&sortDirection=ascending&sortKey=movieMetadata.sortTitle&monitored=true", nil)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(body, &missing)
	if err != nil {
		return nil, err
	}

	for _, mv := range missing.Records {
		minutes, err := utils.MinutesSinceLastSearch(mv.LastSearchTime)
		if err != nil {
			continue
		}
		if minutes > minutesSinceLastSearch {
			moviesIds = append(moviesIds, mv.Id)
		}
	}

	return moviesIds, nil
}

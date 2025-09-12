package discord

import (
	"bytes"
	"encoding/json"
	config "helperr/Services/Config"
	"io"
	"net/http"
)

// discordRequest makes a request to the Discord API.
// Parameters:
//   - method: HTTP method (e.g., "GET", "POST").
//   - url: The Discord API endpoint URL.
//   - body: The request body as an io.Reader.
//
// Returns:
//   - []byte: The response body as a byte slice.
//   - error: An error if the request fails.
func discordRequest(method, url string, body io.Reader) ([]byte, error) {
	discordCliente := &http.Client{}

	request, error := http.NewRequest(method, url, body)
	if error != nil {
		return nil, error
	}
	request.Header.Set("content-type", "application/json; charset=utf-8")

	response, error := discordCliente.Do(request)
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

// DiscordChannel sends a message to a Discord channel.
// Parameters:
//   - log: The message to send to the Discord channel.
//
// Returns:
//   - None
func DiscordChannel(log string) {
	discordUrl := config.Env.DiscordUrl
	discordUsername := config.Env.DiscordUsername
	if discordUsername == "" {
		discordUsername = "Helperr"
	}

	if discordUrl == "" {
		return
	}

	body := map[string]interface{}{
		"content":  log,
		"username": discordUsername,
	}

	jsonBody, error := json.Marshal(body)
	if error != nil {
		println("Discord | Error |", error.Error())
	}

	_, error = discordRequest("POST", discordUrl, bytes.NewBuffer(jsonBody))
	if error != nil {
		println("Discord | Error | error sending message to Discord channel")
	}

}

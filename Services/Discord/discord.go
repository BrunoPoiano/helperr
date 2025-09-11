package discord

import (
	"bytes"
	"encoding/json"
	config "helperr/Services/Config"
	"io"
	"net/http"
)

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

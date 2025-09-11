package telegram

import (
	"bytes"
	"encoding/json"
	"fmt"
	config "helperr/Services/Config"
	"io"
	"net/http"
)

func telegramRequest(method, url string, body io.Reader) ([]byte, error) {
	telCliente := &http.Client{}

	request, error := http.NewRequest(method, "https://api.telegram.org"+url, body)
	if error != nil {
		return nil, error
	}
	request.Header.Set("content-type", "application/json; charset=utf-8")

	response, error := telCliente.Do(request)
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

func TelegramBotChat(log string) {
	telBotTocken := config.Env.TelegramBotToken
	telChatId := config.Env.TelegramChatId

	if telBotTocken == "" || telChatId == 0 {
		return
	}

	body := map[string]interface{}{
		"chat_id":    telChatId,
		"text":       fmt.Sprintf("*Helperr*: \n %s", log),
		"parse_mode": "Markdown",
	}

	bodyJson, error := json.Marshal(body)
	if error != nil {
		println("Telegram | Error |", error.Error())
		return
	}

	url := fmt.Sprintf("/bot%s/sendMessage", telBotTocken)
	_, error = telegramRequest("POST", url, bytes.NewBuffer(bodyJson))
	if error != nil {
		println("Telegram | Error | error sending message to Telegram bot")
	}
}

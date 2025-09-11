package types

type Config struct {
	MissingFilesSearchInternal int
	TelegramBotToken           string
	TelegramChatId             int
	DiscordUrl                 string
	DiscordUsername            string
	UndesiredExtentions        map[string]bool
}

type AlternateTitle struct {
	Title string `json:"title"`
}

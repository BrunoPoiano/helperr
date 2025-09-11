package config

import (
	"helperr/Services/utils"
	"helperr/types"
)

var Env = types.Config{
	MissingFilesSearchInternal: utils.ReturnEnvVariable("MISSING_FILES_SEARCH_INTERVAL", 2880),
	TelegramBotToken:           utils.ReturnEnvVariable("TELEGRAM_BOT_TOKEN", ""),
	TelegramChatId:             utils.ReturnEnvVariable("TELEGRAM_CHAT_ID", 0),
	DiscordUrl:                 utils.ReturnEnvVariable("DISCORD_URL", ""),
	DiscordUsername:            utils.ReturnEnvVariable("DISCORD_USERNAME", "Helperr"),
	UndesiredExtentions:        utils.ParseUndesiredExtentions(utils.ReturnEnvVariable("UNDESIRED_EXTENTIONS", "[.arj, .ink, .lnk, .exe, .rar, .iso]")),
}

package logs

import (
	"fmt"
	discord "helperr/Services/Discord"
	telegram "helperr/Services/Telegram"
	"helperr/types"
	"strings"
	"time"
)

func TimeLogs(logType types.LogType, error bool, log string, sendToUser bool) {

	if !logType.IsValid() {
		println("Error | wrong type on timeLogs |", log)
		return
	}

	now := time.Now().Format("02/01/2006 15:04:05")
	logString := strings.ToUpper(logType.ToString())

	if error {
		logString = fmt.Sprintf("%s | ERROR", logString)
	} else {
		logString = fmt.Sprintf("%s | INFO", logString)
	}

	logString = fmt.Sprintf("%s | %s", logString, log)

	println(now, logString)
	if sendToUser {
		telegram.TelegramBotChat(logString)
		discord.DiscordChannel(logString)
	}
}

func CheckTelegram() {
	telegram.TelegramBotChat("Testing Notification")
}

func CheckDiscord() {
	discord.DiscordChannel("Testing Notification")
}

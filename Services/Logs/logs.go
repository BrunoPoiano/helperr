package logs

import (
	"fmt"
	discord "helperr/Services/Discord"
	telegram "helperr/Services/Telegram"
	"helperr/types"
	"strings"
	"time"
)

// TimeLogs logs the event with the current time, type, and error status.
// Parameters:
//   - logType: The type of log (e.g., "movie", "serie", "torrent").
//   - error: A boolean indicating if the log is an error.
//   - log: The log message.
//   - sendToUser: A boolean indicating whether to send the log to Telegram and Discord.
//
// Returns:
//   - None
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

// CheckTelegram sends a test notification to Telegram.
// Parameters:
//   - None
//
// Returns:
//   - None
func CheckTelegram() {
	telegram.TelegramBotChat("Testing Notification")
}

// CheckDiscord sends a test notification to Discord.
// Parameters:
//   - None
//
// Returns:
//   - None
func CheckDiscord() {
	discord.DiscordChannel("Testing Notification")
}

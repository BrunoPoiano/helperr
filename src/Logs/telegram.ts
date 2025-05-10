/**
 * Sends a message to a Telegram bot.
 * @param {string} log - The message to send to the Telegram bot.
 * @returns {Promise<void>} - A promise that resolves when the message is sent successfully, or rejects if there is an error.
 */
export const telegramBotChat = async (log: string): Promise<void> => {
  const tel_bot_token = process.env.TELEGRAM_BOT_TOKEN;
  const tel_chat_id = process.env.TELEGRAM_CHAT_ID;

  if (!tel_bot_token || !tel_chat_id) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const tel_bot_api_route = `https://api.telegram.org/bot${tel_bot_token}/sendMessage`;
  const body = {
    chat_id: tel_chat_id,
    text: `*qBit-renamer*: \n${log}`,
    parse_mode: "Markdown",
  };

  try {
    await fetch(tel_bot_api_route, {
      signal: controller.signal,
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Error sending message to Telegram bot");
    console.error(error);
    throw Error("Error sending message to Telegram bot");
  } finally {
    clearTimeout(timeout);
  }
};

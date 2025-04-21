import dotenv from "dotenv";
dotenv.config();

export class TimeLogsQueue {
	private queue: Promise<void>;
	constructor() {
		this.queue = Promise.resolve();
	}

	/**
		* Adds a task to the queue. Tasks are executed sequentially.
		* @param {() => Promise<void>} task - The asynchronous task to add to the queue.
		* @returns {Promise<void>} - A promise that resolves when the task is complete.
		*/
	onqueue(task: () => Promise<void>): Promise<void> {
		this.queue = this.queue.then(() => task());
		return this.queue;
	}
}


/**
	* Logs a message with a timestamp and optionally sends it to a Telegram bot.
	* @param {T} log - The message to log. Can be of any type.
	* @param {string} [sendToBot] - An optional string to send to the Telegram bot. If provided, the telegramBotChat function is called.
	* @returns {() => Promise<void>} - A function that, when called, performs the logging and optional Telegram bot message sending.
	*/
export function timeLogs<T>(log: T, sendToBot?: string): () => Promise<void> {
	return async () => {
		const now = new Date();

		const formattedDate = new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		}).format(now);

		console.log(formattedDate, "|", log);

		if (sendToBot) {
			await telegramBotChat(sendToBot);
		}
	};
}

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
	} finally {
		clearTimeout(timeout);
	}
};

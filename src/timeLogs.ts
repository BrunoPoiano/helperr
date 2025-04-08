import dotenv from "dotenv";
dotenv.config();

export class TimeLogsQueue {
	private queue: Promise<void>;
	constructor() {
		this.queue = Promise.resolve();
	}

	onqueue(task: () => Promise<void>): Promise<void> {
		this.queue = this.queue.then(() => task());
		return this.queue;
	}
}

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

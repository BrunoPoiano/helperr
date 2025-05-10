import dotenv from "dotenv";
import { telegramBotChat } from "./telegram.js";
import { discordChannel } from "./discord.js";
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

    console.log(formattedDate, " | ", log);

    if (sendToBot) {
      await telegramBotChat(sendToBot);
      await discordChannel(sendToBot);
    }
  };
}

import { timeLogs, TimeLogsQueue } from "./timeLogs.js";

const queue = new TimeLogsQueue();

queue.onqueue(timeLogs("Telegram test", "telegram test"));

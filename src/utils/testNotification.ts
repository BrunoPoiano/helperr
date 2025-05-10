import { timeLogs, TimeLogsQueue } from "../Logs/logs.js";

const queue = new TimeLogsQueue();

queue.onqueue(timeLogs("Notification Test", "Notification Test"));

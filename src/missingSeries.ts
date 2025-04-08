import dotenv from "dotenv";
import { timeLogs, TimeLogsQueue } from "./timeLogs.js";
dotenv.config();

export const missingSeries = async () => {
	const apiKey = process.env.SONARR_API_KEY;
	const apiUrl = process.env.SONARR_URL;

	if (!apiUrl || !apiKey) {
		return;
	}

	const queue = new TimeLogsQueue();

	await fetch(`${apiUrl}/api/v3/command`, {
		method: "POST",
		headers: {
			"X-api-key": apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "MissingEpisodeSearch", monitored: true }),
	}).then(() => {
		queue.onqueue(
			timeLogs(
				`running Missing Episode Search`,
				`running Missing Episode Search`,
			),
		);
	});
};

if (import.meta.url === `file://${process.argv[1]}`) {
	missingSeries();
}

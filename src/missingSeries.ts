import dotenv from "dotenv";
import { timeLogs } from "./utils";
dotenv.config();

export const missingSeries = async () => {
	const apiKey = process.env.SONARR_API_KEY;
	const apiUrl = process.env.SONARR_URL;

	if (!apiUrl || !apiKey) {
		return;
	}

	await fetch(`${apiUrl}/api/v3/command`, {
		method: "POST",
		headers: {
			"X-api-key": apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "MissingEpisodeSearch", monitored: true }),
	}).then(() => {
		timeLogs(`running Missing Episode Search`);
	});
};

if (import.meta.url === `file://${process.argv[1]}`) {
	missingSeries();
}

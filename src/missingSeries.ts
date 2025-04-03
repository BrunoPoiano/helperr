import dotenv from "dotenv";
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
	});
};

if (import.meta.url === `file://${process.argv[1]}`) {
	missingSeries();
}

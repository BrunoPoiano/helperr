import dotenv from "dotenv";
dotenv.config();

export const missingMovies = async () => {
	const apiKey = process.env.RADARR_API_KEY;
	const apiUrl = process.env.RADARR_URL;

	if (!apiUrl || !apiKey) {
		return;
	}

	await fetch(`${apiUrl}/api/v3/command`, {
		method: "POST",
		headers: {
			"X-api-key": apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: "MissingMoviesSearch", monitored: true }),
	});
};

if (import.meta.url === `file://${process.argv[1]}`) {
	missingMovies();
}

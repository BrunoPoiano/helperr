import dotenv from "dotenv";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
dotenv.config();

/**
 * Searches for missing movies in Radarr
 * Initiates a search for monitored movies that are missing
 * @returns {Promise<void>}
 */
export const missingMovies = async (): Promise<void> => {
  const apiKey = process.env.RADARR_API_KEY;
  const apiUrl = process.env.RADARR_URL;

  // Exit if API credentials are missing
  if (!apiUrl || !apiKey) {
    return;
  }

  const queue = new TimeLogsQueue();

  // Call Radarr API to trigger missing movies search
  await fetch(`${apiUrl}/api/v3/command`, {
    method: "POST",
    headers: {
      "X-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "MissingMoviesSearch", monitored: true }),
  }).then(() => {
    queue.onqueue(
      timeLogs(
        "running Missing Movies Search",
        "running Missing Movies Search",
      ),
    );
  });
};

// Execute the function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  missingMovies();
}

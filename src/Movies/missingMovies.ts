import dotenv from "dotenv";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
import {
  calcHowManyMinutesSinceLastSearch,
  isNumberOrDefault,
} from "../utils/utils.js";
import { getRecordIds } from "../Series/services.js";
dotenv.config();

/**
 * Gets all missing movies that need to be searched
 * @returns Array of movie IDs that need searching
 */
const getAlltheMissingMovies = async (): Promise<number[]> => {
  const apiKey = process.env.RADARR_API_KEY;
  const apiUrl = process.env.RADARR_URL;
  const minutesSinceLastSearch = isNumberOrDefault(
    process.env.SONARR_SEARCH_MISSING_EPS,
    5760,
  );
  if (!apiUrl || !apiKey) {
    return [];
  }

  if (!apiUrl || !apiKey) {
    return [];
  }

  const moviesIds: number[] = [];

  try {
    const response = await fetch(
      `${apiUrl}/api/v3/wanted/missing?page=1&pageSize=1000&sortDirection=ascending&sortKey=movieMetadata.sortTitle&monitored=true`,
      {
        method: "GET",
        headers: {
          "X-api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    const missingMoviess = getRecordIds(data);

    for (const ep of missingMoviess) {
      if (
        ep.airDate &&
        calcHowManyMinutesSinceLastSearch(ep.lastSearchTime) >
          minutesSinceLastSearch
      ) {
        moviesIds.push(ep.id);
      }
    }
  } catch (error) {
    console.error("Error fetching missing Movies:", error);
    throw Error("Error fetching missing Movies");
  }

  return moviesIds;
};

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

  const missingMoviesIds = await getAlltheMissingMovies();

  if (missingMoviesIds.length === 0) {
    console.log("No Movies to search");
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
    body: JSON.stringify({ movieIds: missingMoviesIds, name: "MoviesSearch" }),
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

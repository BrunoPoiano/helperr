import dotenv from "dotenv";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
import {
  calcHowManyMinutesSinceLastSearch,
  isNumberOrDefault,
} from "../utils/utils.js";
import { getRecordIds } from "./services.js";
dotenv.config();

/**
 * Fetches and returns IDs of missing episodes that haven't been searched recently
 * @returns Promise containing array of episode IDs
 */
const getAllTheMissingEps = async (): Promise<number[]> => {
  const apiKey = process.env.SONARR_API_KEY;
  const apiUrl = process.env.SONARR_URL;
  const minutesSinceLastSearch = isNumberOrDefault(
    process.env.SONARR_SEARCH_MISSING_EPS,
    5760,
  );

  if (!apiUrl || !apiKey) {
    return [];
  }

  const epsIds: number[] = [];

  try {
    const response = await fetch(
      `${apiUrl}/api/v3/wanted/missing?page=1&pageSize=1000&sortDirection=descending&sortKey=episodes.airDateUtc&monitored=true`,
      {
        method: "GET",
        headers: {
          "X-api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    const missingEps = getRecordIds(data);

    for (const ep of missingEps) {
      if (
        ep.airDate &&
        calcHowManyMinutesSinceLastSearch(ep.lastSearchTime) >
          minutesSinceLastSearch
      ) {
        epsIds.push(ep.id);
      }
    }
  } catch (error) {
    console.error("Error fetching missing episodes:", error);
    throw Error("Error fetching missing episodes");
  }

  return epsIds;
};

/**
 * Initiates a search for missing episodes in Sonarr
 */
export const missingSeries = async () => {
  const apiKey = process.env.SONARR_API_KEY;
  const apiUrl = process.env.SONARR_URL;

  if (!apiUrl || !apiKey) {
    return;
  }

  const missingEpsIds = await getAllTheMissingEps();

  if (missingEpsIds.length === 0) {
    console.log("No Eps to search");
    return;
  }
  const queue = new TimeLogsQueue();

  await fetch(`${apiUrl}/api/v3/command`, {
    method: "POST",
    headers: {
      "X-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "EpisodeSearch", episodeIds: missingEpsIds }),
  }).then(() => {
    queue.onqueue(
      timeLogs(
        "running Missing Episode Search",
        "running Missing Episode Search",
      ),
    );
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  missingSeries();
}

dotenv.config();

import type { Series } from "../types.js";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
import { getAllSeries, sonarr_cliente } from "./checkSeries.js";
import { getSeriesList } from "./services.js";
import dotenv from "dotenv";

const queue = new TimeLogsQueue();

const apiKey = process.env.SONARR_API_KEY;
const apiUrl = process.env.SONARR_URL;

if (!apiKey || !apiUrl) {
  queue.onqueue(timeLogs("No key or url supplied for sonarr"));
  stop();
}
/**
 * Gets the total count of active torrents in Sonarr.
 * Returns -1 if there's an error fetching the data.
 */
const getSeriesTorrentsLength = async (): Promise<number> => {
  try {
    const all_torrents = await sonarr_cliente.getAllData();
    return all_torrents.raw.length;
  } catch (error) {
    console.error("Error getting radarr torrents");
    console.error(error);
    return -1;
  }
};

/**
 * Renames series episodes in Sonarr
 * Filters for monitored series with episode files and sends rename command
 */
export const renameSeriesEps = async () => {
  const torrentLength: number = await getSeriesTorrentsLength();
  if (torrentLength > 0) {
    queue.onqueue(timeLogs("Can't update title with torrent active"));
    return;
  }

  const series = await getAllSeries();
  const seriesIDs = series.reduce<number[]>((prev, series) => {
    if (
      series.monitored &&
      series.statistics?.episodeFileCount &&
      series.statistics.episodeFileCount > 0
    ) {
      prev.push(series.id);
      return prev;
    }
    return prev;
  }, []);

  if (!seriesIDs.length) {
    queue.onqueue(timeLogs("No series episodes to rename"));
    return;
  }

  await fetch(`${apiUrl}/api/v3/command`, {
    method: "POST",
    headers: {
      "X-api-key": apiKey as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "RenameSeries", seriesIds: seriesIDs }),
  }).then(() => {
    queue.onqueue(
      timeLogs("Running rename series eps", "Running rename series eps"),
    );
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  renameSeriesEps();
}

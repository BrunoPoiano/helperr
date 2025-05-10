import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";
import {
  getSeriesSeason,
  mediaBinarySearch,
  prepareComparisonString,
  returnTorrentList,
} from "../utils/utils.js";
import { timeLogs, TimeLogsQueue } from "../Logs/logs.js";
import type { Series, Torrents } from "../types.js";
import { getSeriesList } from "./services.js";

dotenv.config();
const queue = new TimeLogsQueue();

const apiKey = process.env.SONARR_API_KEY;
const apiUrl = process.env.SONARR_URL;

if (!apiKey || !apiUrl) {
  queue.onqueue(timeLogs("No key or url supplied for sonarr"));
  stop();
}

// Initialize the QBittorrent client for Sonarr
export const sonarr_cliente = new QBittorrent({
  baseUrl: process.env.SONARR_QBITTORRENT_URL,
  username: process.env.SONARR_QBITTORRENT_USERNAME,
  password: process.env.SONARR_QBITTORRENT_PASSWORD,
});

/**
 * Fetches all torrents from QBittorrent
 * @returns Array of torrents
 */
const getAllSeriesTorrents = async (): Promise<Torrents[]> => {
  try {
    const all_torrents = await sonarr_cliente.getAllData();
    return returnTorrentList(all_torrents);
  } catch (error) {
    console.error("Error getting sonarr torrents");
    console.error(error);
    return [];
  }
};

/**
 * Retrieves all series from Sonarr API
 * @returns Array of series
 */
export const getAllSeries = async (): Promise<Series[]> => {
  try {
    let series: Series[] = [];

    await fetch(`${apiUrl}/api/v3/series`, {
      method: "GET",
      headers: {
        "X-api-key": apiKey as string,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        series = getSeriesList(data);
      });

    return series;
  } catch (error) {
    console.error("Error getting sonarr series");
    console.error(error);
    return [];
  }
};

/**
 * Main function to compare torrents with series and update their locations
 */
export const seriesCompareAndChangeLocation = async () => {
  const torrents = await getAllSeriesTorrents();
  queue.onqueue(timeLogs("running series check"));
  if (torrents.length === 0) {
    queue.onqueue(timeLogs("No new series files to update"));
    return;
  }

  const series = await getAllSeries();

  for (const torrent of torrents) {
    const torrent_name = prepareComparisonString(torrent.name);
    const serie = mediaBinarySearch(series, torrent_name);

    if (serie === null) {
      queue.onqueue(
        timeLogs(
          `Not found match series for ${torrent_name}`,
          `Not found match series for ${torrent_name}`,
        ),
      );
      continue;
    }

    await updateTorrent(serie as Series, torrent);
  }
};

/**
 * Updates a torrent's location based on the series information
 * @param serie The series object containing information about the TV show
 * @param torrent The torrent object to be updated
 */
const updateTorrent = async (serie: Series, torrent: Torrents) => {
  // Log the start of the update process
  queue.onqueue(timeLogs(`Series | Running update on ${torrent.name}`));

  // Extract the series name from the path
  const split = serie.path.split("/");
  const series_name = split[split.length - 1];

  // Get the season information from the torrent name
  const season = getSeriesSeason(torrent.name);

  // Construct the base path and season-specific path
  const base_path = `${process.env.SONARR_DOWNLOAD_PATH}${series_name}`;
  const season_path = `${process.env.SONARR_DOWNLOAD_PATH}${series_name}/${season}`;

  try {
    // Retrieve the files contained in the torrent
    const torrent_contents = await sonarr_cliente.torrentFiles(torrent.hash);

    // Handle multi-file torrents differently than single-file torrents
    if (torrent_contents.length > 1) {
      // For multi-file torrents, we need to rename the folder and move it
      const old_path = torrent.content_path.split("/");
      const season = getSeriesSeason(old_path[old_path.length - 1]);

      // Rename the folder to match the season format
      await sonarr_cliente
        .renameFolder(torrent.hash, old_path[old_path.length - 1], season)
        .catch((err) => {
          console.error("Series | Error renaming folder | ", serie.title);
          console.error(err);
        });

      // Move the torrent to the base path for the series
      await sonarr_cliente
        .setTorrentLocation(torrent.hash, base_path)
        .catch((err) => {
          console.error("Series | error changing the location | ", serie.title);
          console.error(err);
        });
    } else {
      // For single-file torrents, move directly to the season-specific path
      sonarr_cliente
        .setTorrentLocation(torrent.hash, season_path)
        .catch((err) => {
          console.error("Series | error changing the location | ", serie.title);
          console.error(err);
        });
    }

    // Log details about the completed operation
    queue.onqueue(
      timeLogs(
        {
          "torrent name": torrent.name,
          "series title": serie.title,
          "series sonarr path": serie.path,
          "new torrent location": season_path,
        },
        `A new ${serie.title} episode was moved to "${season_path}"`,
      ),
    );
  } catch (error) {
    // Log unexpected errors during processing
    queue.onqueue(
      timeLogs(
        `Unexpected error processing Series ${torrent.name}`,
        `Unexpected error processing Series ${torrent.name}`,
      ),
    );
    console.error(error);
  }
};

// Execute the main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seriesCompareAndChangeLocation();
}

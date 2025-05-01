import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";
import {
  getFileExtension,
  mediaBinarySearch,
  prepareComparisonString,
  returnTorrentList,
} from "../utils/utils.js";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
import type { Movies, Torrents } from "../types.js";
import { getMoviesList } from "./services.js";

dotenv.config();

const queue = new TimeLogsQueue();

const radarr_url = process.env.RADARR_URL;
const radarr_key = process.env.RADARR_API_KEY;

if (!radarr_url || !radarr_key) {
  queue.onqueue(timeLogs("No key or url supplied for radar"));
  stop();
}

/**
 * QBittorrent client for Radarr
 */
export const radarr_cliente = new QBittorrent({
  baseUrl: process.env.RADARR_QBITTORRENT_URL,
  username: process.env.RADARR_QBITTORRENT_USERNAME,
  password: process.env.RADARR_QBITTORRENT_PASSWORD,
});

/**
 * Fetches all movie torrents from qBittorrent
 * @returns Array of torrents
 */
const getAllMoviesTorrents = async (): Promise<Torrents[]> => {
  try {
    const all_torrents = await radarr_cliente.getAllData();
    return returnTorrentList(all_torrents);
  } catch (error) {
    console.error("Error getting radarr torrents");
    console.error(error);
    return [];
  }
};

/**
 * Fetches all movies from Radarr API
 * @returns Array of movies
 */
export const getAllMovies = async (): Promise<Movies[]> => {
  try {
    let movies: Movies[] = [];

    await fetch(`${radarr_url}/api/v3/movie`, {
      method: "GET",
      headers: {
        "X-api-key": radarr_key as string,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        movies = getMoviesList(data);
      });

    return movies;
  } catch (error) {
    console.error("Error getting radarr movies");
    console.error(error);
    return [];
  }
};

/**
 * Compares torrents with movies and updates locations
 */
export const moviesCompareAndChangeLocation = async () => {
  queue.onqueue(timeLogs("running movies check"));

  const torrents = await getAllMoviesTorrents();
  if (torrents.length === 0) {
    queue.onqueue(timeLogs("No new movie files to update"));
    return;
  }

  const movies = await getAllMovies();

  for (const torrent of torrents) {
    const torrent_name = prepareComparisonString(torrent.name);
    const movie = mediaBinarySearch(movies, torrent_name);

    if (movie === null) {
      queue.onqueue(
        timeLogs(
          `Not found match movie for ${torrent_name}`,
          `Not found match movie for ${torrent_name}`,
        ),
      );
      continue;
    }
    updateTorrent(movie as Movies, torrent);
  }
};

/**
 * Updates torrent name and location based on movie metadata
 * @param movie Movie object
 * @param torrent Torrent object
 */
const updateTorrent = async (movie: Movies, torrent: Torrents) => {
  // Log that we're starting an update
  queue.onqueue(timeLogs(`Movie | Running update on ${torrent.name}`));

  // Extract movie name from the movie path
  const movie_split = movie.path.split("/");
  const movie_name = movie_split[movie_split.length - 1];

  // Define base and full paths for the download
  const base_path = `${process.env.RADARR_DOWNLOAD_PATH}`;
  const full_path = `${process.env.RADARR_DOWNLOAD_PATH}${movie_name}`;

  try {
    // Fetch the contents of the torrent
    const torrent_contents = await radarr_cliente.torrentFiles(torrent.hash);

    // Handle torrents with multiple files (folders)
    if (torrent_contents.length > 1) {
      // Get the current folder name from the torrent path
      const old_path = torrent.content_path.split("/");
      const old_folder_name = old_path[old_path.length - 1];

      // Rename the folder if it doesn't match the movie name
      if (old_folder_name !== movie_name) {
        await radarr_cliente
          .renameFolder(torrent.hash, old_folder_name, movie_name)
          .catch((err) => {
            console.error("Movies | error renaming folder | ", movie.title);
            console.error(err);
          });
      }

      // Iterate through files in the folder and rename them
      for (const file of torrent_contents) {
        const extention = getFileExtension(file.name);
        const old_file_path = file.name.split("/");
        const new_file_name = `${movie_name}.${extention}`;

        // Only rename media files and NFO files if they don't already have the correct name
        if (
          extention &&
          ["mp4", "mkv", "avi", "mov", "webm", "nfo"].includes(extention) &&
          old_file_path[1] !== new_file_name
        ) {
          try {
            await radarr_cliente.renameFile(
              torrent.hash,
              `${movie_name}/${old_file_path[1]}`,
              `${movie_name}/${new_file_name}`,
            );
          } catch (err) {
            console.error(
              `Movies | error renaming file ${old_file_path[1]} | ${movie.title}`,
            );
            console.error(err);
          }
        }
      }

      // Move the torrent to the base path if it's not already there
      if (torrent.content_path !== base_path) {
        await radarr_cliente
          .setTorrentLocation(torrent.hash, base_path)
          .catch((err) => {
            console.error(
              "Movies | error changing the location | ",
              movie.title,
            );
            console.error(err);
          });
      }
    } else {
      // Handle single file torrents
      const old_path = torrent.content_path.split("/");
      const old_file_name = old_path[old_path.length - 1];

      // Rename the file if it doesn't match the movie name
      if (old_file_name !== movie_name) {
        try {
          await radarr_cliente.renameFile(
            torrent.hash,
            old_file_name,
            movie_name,
          );
        } catch (err) {
          timeLogs(
            `Movies | error renaming file ${old_file_name} | ${movie.title}`,
          );
          console.error(err);
        }
      }

      // Move the torrent to the full path if it's not already there
      if (torrent.content_path !== full_path) {
        await radarr_cliente
          .setTorrentLocation(torrent.hash, full_path)
          .catch((err) => {
            timeLogs(`Movies | error changing the location | ${movie.title}`);
            console.error(err);
          });
      }
    }

    // Log successful update with details
    queue.onqueue(
      timeLogs(
        {
          "torrent name": torrent.name,
          "movie title": movie.title,
          "movie radarr path": movie.path,
          "new torrent location": full_path,
        },
        `Movies | ${movie.title} moved to "${full_path}"`,
      ),
    );
  } catch (error) {
    // Log unexpected errors during processing
    queue.onqueue(
      timeLogs(
        `Unexpected error processing Movie ${torrent.name}`,
        `Unexpected error processing Movie ${torrent.name}`,
      ),
    );
    console.error(error);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  moviesCompareAndChangeLocation();
}

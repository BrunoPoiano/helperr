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
  const movie_split = movie.path.split("/");
  const movie_name = movie_split[movie_split.length - 1];
  let new_path = "";

  queue.onqueue(timeLogs(`Movie | Running update on ${torrent.name}`));

  const torrent_contents = await radarr_cliente.torrentFiles(torrent.hash);

  if (torrent_contents.length > 1) {
    //rename folder
    const old_path = torrent.content_path.split("/");
    await radarr_cliente
      .renameFolder(torrent.hash, old_path[old_path.length - 1], movie_name)
      .catch((err) => {
        console.error("Movies | error renaming folder | ", movie.title);
        console.error(err);
      });

    //rename files inside folder
    for (const file of torrent_contents) {
      const extention = getFileExtension(file.name);
      const old_file_path = file.name.split("/");

      if (
        extention &&
        ["mp4", "mkv", "avi", "mov", "webm", "nfo"].includes(extention)
      ) {
        await radarr_cliente
          .renameFile(
            torrent.hash,
            `${movie_name}/${old_file_path[1]}`,
            `${movie_name}/${movie_name}.${extention}`,
          )
          .catch((err) => {
            console.error("Movies | error renaming files | ", movie.title);
            console.error(err);
          });
      }
    }

    //change the location
    new_path = `${process.env.RADARR_DOWNLOAD_PATH}`;
    await radarr_cliente
      .setTorrentLocation(torrent.hash, new_path)
      .catch((err) => {
        console.error("Movies | error changing the location | ", movie.title);
        console.error(err);
      });
  } else {
    const old_path = torrent.content_path.split("/");

    //rename the file
    await radarr_cliente
      .renameFile(torrent.hash, old_path[old_path.length - 1], movie_name)
      .catch((err) => {
        console.error("Movies | error renaming file | ", movie.title);
        console.error(err);
      });

    //change the location and add the folder
    new_path = `${process.env.RADARR_DOWNLOAD_PATH}${movie_name}`;
    radarr_cliente.setTorrentLocation(torrent.hash, new_path).catch((err) => {
      console.error("Movies | error changing the location | ", movie.title);
      console.error(err);
    });
  }

  queue.onqueue(
    timeLogs(
      {
        "torrent name": torrent.name,
        "movie title": movie.title,
        "movie radarr path": movie.path,
        "new torrent location": new_path,
      },
      `${movie.title} moved to "${new_path}"`,
    ),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  moviesCompareAndChangeLocation();
}

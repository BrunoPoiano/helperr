import dotenv from "dotenv";
import { getAllMovies, radarr_cliente } from "./checkMovies.js";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
import type { Movies } from "../types.js";
import { getMoviesList } from "./services.js";
import { countImdbidTags } from "../utils/utils.js";
dotenv.config();

const queue = new TimeLogsQueue();

/**
 * Gets the count of torrents currently in Radarr
 * @returns The number of torrents or -1 if there's an error
 */
const getMoviesTorrentsLength = async (): Promise<number> => {
  try {
    const all_torrents = await radarr_cliente.getAllData();
    return all_torrents.raw.length;
  } catch (error) {
    console.error("Error getting radarr torrents");
    console.error(error);
    return -1;
  }
};

/**
 * Renames movie files in Radarr to match the correct format
 * Only runs when no torrents are active
 */
const renameRadarrMovies = async () => {
  const radarr_url = process.env.RADARR_URL;
  const radarr_key = process.env.RADARR_API_KEY;

  if (!radarr_url || !radarr_key) {
    queue.onqueue(timeLogs("No key or url supplied for radar"));
    return;
  }

  const torrentLength: number = await getMoviesTorrentsLength();
  if (torrentLength > 0) {
    queue.onqueue(timeLogs("Can't update title with torrent active"));
    return;
  }

  const movies = await getAllMovies();

  for (const movie of movies) {
    if (countImdbidTags(movie.movieFile?.path || "") > 1) {
      continue;
    }

    const body = {
      name: "RenameFiles",
      movieId: movie.id,
      files: [movie.movieFileId],
    };

    await fetch(`${radarr_url}/api/v3/command`, {
      method: "POST",
      headers: {
        "X-api-key": radarr_key,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    })
      .then(() => {
        queue.onqueue(
          timeLogs({
            "movie id": movie.id,
            "movie title": movie.title,
            "movie path": movie.movieFile?.path,
          }),
        );
      })
      .catch((err) => {
        console.log("error", err);
      });
  }
};

renameRadarrMovies();

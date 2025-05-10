import dotenv from "dotenv";
import { getAllMovies, radarr_cliente } from "./checkMovies.js";
import { timeLogs, TimeLogsQueue } from "../Logs/logs.js";
import { countImdbidTags } from "../utils/utils.js";
dotenv.config();

const queue = new TimeLogsQueue();
const radarr_url = process.env.RADARR_URL;
const radarr_key = process.env.RADARR_API_KEY;

if (!radarr_url || !radarr_key) {
  queue.onqueue(timeLogs("No key or url supplied for radar"));
  stop();
}

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
export const renameRadarrMovies = async () => {
  const torrentLength: number = await getMoviesTorrentsLength();
  if (torrentLength > 0) {
    queue.onqueue(timeLogs("Can't update title with torrent active"));
    return;
  }

  const movies = await getAllMovies();
  const moviesIds = movies.reduce<number[]>((prev, movie) => {
    if (!movie.monitored) return prev;
    if (countImdbidTags(movie.movieFile?.path || "") > 1) {
      return prev;
    }
    if (movie.statistics?.movieFileCount === 0) {
      return prev;
    }

    prev.push(movie.id);

    return prev;
  }, []);

  const body = {
    name: "RenameMovie",
    movieIds: moviesIds,
  };

  await fetch(`${radarr_url}/api/v3/command`, {
    method: "POST",
    headers: {
      "X-api-key": radarr_key as string,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  })
    .then(() => {
      queue.onqueue(timeLogs("Running rename movies", "Running rename movies"));
    })
    .catch((err) => {
      console.log("error", err);
    });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  renameRadarrMovies();
}

import dotenv from "dotenv";
import { radarr_cliente } from "./checkMovies.js";
import { timeLogs, TimeLogsQueue } from "../utils/timeLogs.js";
import type { Movies } from "../types.js";
dotenv.config();

const queue = new TimeLogsQueue();

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

const getAllMovies = async (): Promise<Movies[]> => {
  try {
    const movies: Movies[] = [];
    const radarr_url = process.env.RADARR_URL;
    const radarr_key = process.env.RADARR_API_KEY;

    if (!radarr_url || !radarr_key) {
      queue.onqueue(timeLogs("No key or url supplied for radar"));
      return movies;
    }

    await fetch(`${radarr_url}/api/v3/movie`, {
      method: "GET",
      headers: {
        "X-api-key": radarr_key,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        for (const element of data) {
          const path = element.path?.replace("/downloads/", "");

          if (
            element.movieFile?.relativePath &&
            !element.movieFile?.relativePath?.includes(path || "")
          ) {
            movies.push({
              id: element.id,
              title: element.title,
              path: element.path,
              movieFileId: element.movieFileId,
              movieFile: {
                path: element.movieFile.path,
                relativePath: element.movieFile.relativePath,
              },
            });
          }
        }
      });

    return movies;
  } catch (error) {
    console.error("Error getting radarr movies");
    console.error(error);
    return [];
  }
};

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

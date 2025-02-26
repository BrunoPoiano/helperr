import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";
dotenv.config();

type Movies = {
	id: number;
	title: string;
	movieFileId: number;
	path?: string;
	movieFile?: {
		path: string;
		relativePath: string;
	};
};

type Series = {
	title: string;
	path: string;
};

const timeLogs = <T>(log: T) => {
	const now = new Date();

	const formattedDate = new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).format(now);

	console.log(formattedDate, "|", log);
};

// Radarr section
const radarr_cliente = new QBittorrent({
	baseUrl: process.env.RADARR_QBITTORRENT_URL,
	username: process.env.RADARR_QBITTORRENT_USERNAME,
	password: process.env.RADARR_QBITTORRENT_PASSWORD,
});

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
			timeLogs("No key or url supplied for radar");
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
		timeLogs("No key or url supplied for radar");
		return;
	}

	const torrentLength: number = await getMoviesTorrentsLength();
	if (torrentLength > 0) {
		timeLogs("Can't update title with torrent active");
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
				timeLogs({
					"movie id": movie.id,
					"movie title": movie.title,
					"movie path": movie.movieFile?.path,
				});
			})
			.catch((err) => {
				console.log("error", err);
			});
	}
};

renameRadarrMovies();
/*
// Sonarr section
const sonarr_cliente = new QBittorrent({
  baseUrl: process.env.SONARR_QBITTORRENT_URL,
  username: process.env.SONARR_QBITTORRENT_USERNAME,
  password: process.env.SONARR_QBITTORRENT_PASSWORD,
});

const getAllSeriesTorrents = async (): Promise<number> => {
  try {
    const all_torrents = await sonarr_cliente.getAllData();

    return all_torrents.raw.length;
  } catch (error) {
    console.error("Error getting sonarr torrents");
    console.error(error);
    return -1;
  }
};
 * */

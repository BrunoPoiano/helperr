import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";
import {
	Movies,
	prepareComparisonString,
	timeLogs,
	Torrents,
} from "./utils.js";

dotenv.config();

export const radarr_cliente = new QBittorrent({
	baseUrl: process.env.RADARR_QBITTORRENT_URL,
	username: process.env.RADARR_QBITTORRENT_USERNAME,
	password: process.env.RADARR_QBITTORRENT_PASSWORD,
});

const getAllMoviesTorrents = async (): Promise<Torrents[]> => {
	try {
		const all_torrents = await radarr_cliente.getAllData();

		const torrents = all_torrents.raw.filter((item: Torrents) => {
			if (
				item.category === "radarr" &&
				item.save_path === "/downloads/radarr"
			) {
				return {
					hash: item.hash,
					name: item.name,
				};
			}
		});

		return torrents;
	} catch (error) {
		console.error("Error getting radarr torrents");
		console.error(error);
		return [];
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
				data.forEach((element: Movies) => {
					movies.push({
						id: element.id,
						title: element.title,
						path: element.path,
					});
				});
			});

		return movies;
	} catch (error) {
		console.error("Error getting radarr movies");
		console.error(error);
		return [];
	}
};

export const moviesCompareAndChangeLocation = async () => {
	timeLogs("running movies check");

	const torrents = await getAllMoviesTorrents();
	if (torrents.length === 0) {
		timeLogs("No new movie files to update");
		return;
	}

	const movies = await getAllMovies();
	if (movies.length === 0) {
		return;
	}

	for (const torrent of torrents) {
		const torrent_name = prepareComparisonString(torrent.name);

		for (const movie of movies) {
			const movie_title = prepareComparisonString(movie.title);

			if (
				torrent_name === movie_title ||
				torrent_name.match(new RegExp(`\\b${movie_title}\\b`))
			) {
				let new_path = movie.path?.replace("/downloads/", "");
				new_path = `/downloads/radarr/${new_path}`;

				timeLogs({
					"torrent name comparison": torrent_name,
					"movie name comparison": movie_title,
					"torrent name": torrent.name,
					"movie title": movie.title,
					"movie path": movie.path,
					"new torrent location": new_path,
				});

				radarr_cliente.setTorrentLocation(torrent.hash, new_path);
				break;
			}
		}
	}
};

if (import.meta.url === `file://${process.argv[1]}`) {
	moviesCompareAndChangeLocation();
}

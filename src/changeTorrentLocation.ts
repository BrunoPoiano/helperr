import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";

dotenv.config();

type Movies = {
	title: string;
	path: string;
};

type Series = {
	title: string;
	path: string;
};

type Torrents = {
	hash: string;
	name: string;
	category?: string;
	save_path?: string;
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

const prepareComparisonString = (item: string): string => {
	let name = item.toLowerCase();

	name = name.replace(/s\d{2}e\d{2}/gi, "");
	name = name.replace(/\b(19|20|21)\d{2}\b/g, "");
	name = name.replace(/[\[\(].*?[\]\)]/g, "");

	const infoList = [
		"amzn",
		"web-dl",
		"blueray",
		"ddp5",
		"yts",
		"playweb",
		"720p",
		"1080p",
		"2160p",
		"upscaled",
		"h265",
		"h264",
		"dv",
		"hdr10+",
		"hdr",
		"ac3",
		"5.1",
		"sub",
		"lcdom",
		"webrip",
		"x265",
		"10bit",
		"aac5.1",
		"ita",
		"eng",
		"multi",
		"aac",
		"v3",
		"mkv",
		"mp4",
		"avi",
	];

	for (const info of infoList) {
		const regex = new RegExp(`\\b${info}\\b`, "gi");
		name = name.replace(regex, "");
	}

	name = name.replace(/\s*\.\s*/g, " ");
	name = name.replace(/\s+/g, " ").trim();

	return name;
};

// Radarr section
const radarr_cliente = new QBittorrent({
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

const moviesCompareAndChangeLocation = async () => {
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
				let new_path = movie.path.replace("/downloads/", "");
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

// Sonarr section
const sonarr_cliente = new QBittorrent({
	baseUrl: process.env.SONARR_QBITTORRENT_URL,
	username: process.env.SONARR_QBITTORRENT_USERNAME,
	password: process.env.SONARR_QBITTORRENT_PASSWORD,
});

const getAllSeriesTorrents = async (): Promise<Torrents[]> => {
	try {
		const all_torrents = await sonarr_cliente.getAllData();

		const torrents = all_torrents.raw.filter((item: Torrents) => {
			if (
				item.category === "tv-sonarr" &&
				item.save_path === "/downloads/tv-sonarr"
			) {
				return {
					hash: item.hash,
					name: item.name,
				};
			}
		});

		return torrents;
	} catch (error) {
		console.error("Error getting sonarr torrents");
		console.error(error);
		return [];
	}
};

const getAllSeries = async (): Promise<Series[]> => {
	try {
		const series: Series[] = [];
		const apiKey = process.env.SONARR_API_KEY;
		const apiUrl = process.env.SONARR_URL;

		if (!apiKey || !apiUrl) {
			timeLogs("No key or url supplied for sonarr");
			return series;
		}

		await fetch(`${apiUrl}/api/v3/series`, {
			method: "GET",
			headers: {
				"X-api-key": apiKey,
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				for (const item of data) {
					series.push({
						title: item.title,
						path: item.path,
					});
				}
			});

		return series;
	} catch (error) {
		console.error("Error getting sonarr series");
		console.error(error);
		return [];
	}
};

const seriesCompareAndChangeLocation = async () => {
	const torrents = await getAllSeriesTorrents();
	timeLogs("running series check");
	if (torrents.length === 0) {
		timeLogs("No new series files to update");
		return;
	}

	const series = await getAllSeries();
	if (series.length === 0) {
		return;
	}

	for (const torrent of torrents) {
		const torrent_name = prepareComparisonString(torrent.name);

		for (const serie of series) {
			const serie_title = prepareComparisonString(serie.title);

			if (
				torrent_name === serie_title ||
				torrent_name.match(new RegExp(`\\b${serie_title}\\b`))
			) {
				let new_path = serie.path.replace("/data/downloads/tv-sonarr/", "");
				new_path = `/downloads/tv-sonarr/${new_path}`;

				timeLogs({
					"torrent name comparison": torrent_name,
					"series name comparison": serie_title,
					"torrent name": torrent.name,
					"series title": serie.title,
					"series path": serie.path,
					"new torrent location": new_path,
				});

				sonarr_cliente.setTorrentLocation(torrent.hash, new_path);
				break;
			}
		}
	}
};

// Execute
moviesCompareAndChangeLocation();
seriesCompareAndChangeLocation();

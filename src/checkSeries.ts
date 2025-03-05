import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";
import {
	Content,
	getSeriesSeason,
	mediaBinarySearch,
	prepareComparisonString,
	pushBinarySorted,
	Series,
	timeLogs,
	Torrents,
} from "./utils.js";
import { warn } from "console";

dotenv.config();

const sonarr_cliente = new QBittorrent({
	baseUrl: process.env.SONARR_QBITTORRENT_URL,
	username: process.env.SONARR_QBITTORRENT_USERNAME,
	password: process.env.SONARR_QBITTORRENT_PASSWORD,
});

const getAllSeriesTorrents = async (): Promise<Torrents[]> => {
	try {
		const all_torrents = await sonarr_cliente.getAllData();
		const torrents: Torrents[] = [];
		for (const item of all_torrents.raw) {
			if (
				item.category === "tv-sonarr" &&
				item.save_path === "/downloads/tv-sonarr"
			) {
				torrents.push({
					hash: item.hash,
					name: item.name,
					content_path: item.content_path,
				});
			}
		}

		return torrents;
	} catch (error) {
		console.error("Error getting sonarr torrents");
		console.error(error);
		return [];
	}
};

const getAllSeries = async (): Promise<Series[]> => {
	try {
		let series: Series[] = [];
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
						alternateTitles: item.alternateTitles,
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

export const seriesCompareAndChangeLocation = async () => {
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
		const serie = mediaBinarySearch(series, torrent_name);
		if (serie) {
			await updateTorrent(serie, torrent);
		} else {
			timeLogs(
				`Not found match series for ${torrent_name}`,
				`Not found match series for ${torrent_name}`,
			);
		}
	}
};

const updateTorrent = async (serie: Series | Content, torrent: Torrents) => {
	const split = serie.path.split("/");
	const series_name = split[split.length - 1];
	let new_path = "";

	const torrent_contents = await sonarr_cliente.torrentFiles(torrent.hash);
	if (torrent_contents.length > 1) {
		//rename folder
		const old_path = torrent.content_path.split("/");
		const season = getSeriesSeason(old_path[old_path.length - 1]);

		await sonarr_cliente.renameFolder(
			torrent.hash,
			old_path[old_path.length - 1],
			season,
		);

		//change the location
		new_path = `${process.env.SONARR_DOWNLOAD_PATH}${series_name}`;
		await sonarr_cliente.setTorrentLocation(torrent.hash, new_path);
	} else {
		//change the location and add folders
		const season = getSeriesSeason(torrent.name);
		new_path = `${process.env.SONARR_DOWNLOAD_PATH}${series_name}/${season}`;
		sonarr_cliente.setTorrentLocation(torrent.hash, new_path);
	}

	await timeLogs(
		{
			"torrent name": torrent.name,
			"series title": serie.title,
			"series sonarr path": serie.path,
			"new torrent location": new_path,
		},
		`A new ${serie.title} episode was moved to "${new_path}"`,
	);
};

if (import.meta.url === `file://${process.argv[1]}`) {
	seriesCompareAndChangeLocation();
}

import dotenv from "dotenv";
import { QBittorrent } from "@ctrl/qbittorrent";
import {
  prepareComparisonString,
  Series,
  timeLogs,
  Torrents,
} from "./index.js";

dotenv.config();

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

seriesCompareAndChangeLocation();

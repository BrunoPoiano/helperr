import { moviesCompareAndChangeLocation } from "./checkMovies.js";
import { seriesCompareAndChangeLocation } from "./checkSeries.js";

export type Movies = {
  id: number;
  title: string;
  movieFileId?: number;
  path?: string;
  movieFile?: {
    path: string;
    relativePath: string;
  };
};

export type Series = {
  title: string;
  path: string;
};

export type Torrents = {
  hash: string;
  name: string;
  category?: string;
  save_path?: string;
};

export const timeLogs = <T>(log: T) => {
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

export const prepareComparisonString = (item: string): string => {
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

moviesCompareAndChangeLocation();
seriesCompareAndChangeLocation();

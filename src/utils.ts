import dotenv from "dotenv";
import { argv0 } from "process";
dotenv.config();

export type Content = {
  title: string;
  path: string;
};

export type Movies = Content & {
  id: number;
  movieFileId?: number;
  movieFile?: {
    path: string;
    relativePath: string;
  };
};

export type Series = Content & {
  alternateTitles: {
    title: string;
  }[];
};

export type Torrents = {
  hash: string;
  name: string;
  category?: string;
  save_path?: string;
  content_path: string;
};

export type TorrentContents = {
  index: string;
  name: string;
};

export const timeLogs = async <T>(log: T, sendToBot?: string) => {
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

  if (sendToBot) {
    await telegramBotChat(sendToBot);
  }
};

export const telegramBotChat = async (log: string) => {
  const tel_bot_token = process.env.TELEGRAM_BOT_TOKEN;
  const tel_chat_id = process.env.TELEGRAM_CHAT_ID;

  if (!tel_bot_token || !tel_chat_id) return;

  const tel_bot_api_route = `https://api.telegram.org/bot${tel_bot_token}/sendMessage`;
  const body = {
    chat_id: tel_chat_id,
    text: `*qBit-renamer*: \n${log}`,
    parse_mode: "Markdown",
  };

  try {
    await fetch(tel_bot_api_route, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Error sending message to Telegram bot");
    console.error(error);
  }
};

export const prepareComparisonString = (item: string): string => {
  let name = item.toLowerCase();

  name = name.replace(/s\d{2}e\d{2}/gi, ""); // remove "S01E02"
  name = name.replace(/\b(19|20|21)\d{2}\b/g, ""); // remove year
  name = name.replace(/[\[\(].*?[\]\)]/g, ""); // remove content inside () and []
  name = name.replace(/\s-\s\d{2}/g, ""); // remove ep pattern
  name = name.replace(/:/g, ""); // remove :

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
    "web",
    "bili",
    "aac2",
    "264-vary",
    "-higgsboson",
    "multi",
    "aac",
    "v3",
    "mkv",
    "mp4",
    "avi",
    "-successfulcrab",
  ];

  for (const info of infoList) {
    const regex = new RegExp(`\\b${info}\\b`, "gi");
    name = name.replace(regex, "");
  }

  name = name.replace(/\s*\.\s*/g, " "); // replace . surrounded by spaces with a single space
  name = name.replace(/\s+/g, " ").trim(); // Normalize whitespace by collapsing multiple spaces into a single space and trimming

  return name;
};

export const pushBinarySorted = (series: Series[], serie: Series): Series[] => {
  let start = 0;
  let end = series.length - 1;

  while (start <= end) {
    let middle = Math.floor((end + start) / 2);
    if (series[middle].title.localeCompare(serie.title) < 0) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }
  series.splice(start, 0, serie);

  return series;
};

export const mediaBinarySearch = (
  content: any[],
  compare: string,
): any | null => {
  let start = 0;
  let end = content.length - 1;

  const content_sorted = [...content].sort((a: Content, b: Content) =>
    a.title.localeCompare(b.title),
  );

  // Search Main Title
  while (end >= start) {
    let middle = Math.floor((end + start) / 2);
    const serie_title = prepareComparisonString(content_sorted[middle].title);

    if (serie_title === compare) {
      return content_sorted[middle];
    }

    if (checkSimilar(serie_title, compare) >= 95) {
      return content_sorted[middle];
    }

    if (compare.match(new RegExp(`\\b${serie_title}\\b`))) {
      return content_sorted[middle];
    }

    if (compare.localeCompare(serie_title) < 0) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }

  // Searching Alternative titles
  // animes and foreign titles
  for (const item of content_sorted) {
    if (item.alternateTitles.length > 0) {
      for (const alt_title of item.alternateTitles) {
        const item_title = prepareComparisonString(alt_title.title);

        if (item_title === compare) {
          return item;
        }

        if (checkSimilar(item_title, compare) >= 95) {
          return item;
        }

        if (compare.match(new RegExp(`\\b${item_title}\\b`))) {
          return item;
        }
      }
    }
  }

  return null;
};

const checkSimilar = (source: string, target: string): number => {
  if (source.length === 0 && target.length === 0) return 100;

  const distance = LevenshteinDistance(source, target);
  const maxLength = Math.max(source.length, target.length);

  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity * 100) / 100;
};

const LevenshteinDistance = (source: string, target: string): number => {
  let matrix: number[][] = Array.from({ length: source.length + 1 }, () =>
    Array.from({ length: target.length + 1 }, () => 0),
  );

  for (let x = 0; x <= source.length; x++) {
    matrix[x][0] = x;
  }

  for (let y = 0; y <= source.length; y++) {
    matrix[0][y] = y;
  }

  for (let x = 1; x <= source.length; x++) {
    for (let y = 1; y <= source.length; y++) {
      if (source[x - 1] === target[y - 1]) {
        matrix[x][y] = matrix[x - 1][y - 1];
      } else {
        matrix[x][y] = Math.min(
          matrix[x][y - 1] + 1,
          matrix[x - 1][y] + 1,
          matrix[x - 1][y - 1] + 1,
        );
      }
    }
  }

  return matrix[source.length][source.length];
};

export const getFileExtension = (filename: string): string | null => {
  const match = filename.match(/\.([^.]*)$/);
  return match ? match[1] : null;
};

export const getSeriesSeason = (torrent_name: string): string => {
  const name = torrent_name.replace(".", " ");

  const series_season = name.match(/s\d{2}e\d{2}/i); // check for "S00E00"
  if (series_season) {
    const season = series_season[0].match(/[Ss](\d{2})[Ee]\d{2}/);
    if (season) {
      return `Season ${season[1]}`;
    }
  }

  const whole_season = name.match(/[sS]01/); // check for "S00"
  if (whole_season) {
    const season = whole_season[0].replace("S", "").replace("s", "");
    return `Season ${season}`;
  }

  return "";
};

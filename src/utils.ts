import dotenv from "dotenv";
dotenv.config();

export type Movies = {
  id: number;
  title: string;
  movieFileId?: number;
  path: string;
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

  name = name.replace(/s\d{2}e\d{2}/gi, "");
  name = name.replace(/\b(19|20|21)\d{2}\b/g, "");
  name = name.replace(/[\[\(].*?[\]\)]/g, "");
  name = name.replace(/\s-\s\d{2}/g, "");

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

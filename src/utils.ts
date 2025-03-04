import dotenv from "dotenv";
import { argv0 } from "process";
dotenv.config();

type Content = {
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

export type Series = Content & {};

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
	];

	for (const info of infoList) {
		const regex = new RegExp(`\\b${info}\\b`, "gi");
		name = name.replace(regex, "");
	}

	name = name.replace(/\s*\.\s*/g, " ");
	name = name.replace(/\s+/g, " ").trim();

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
	content: Content[],
	compare: string,
): Content | null => {
	let start = 0;
	let end = content.length - 1;

	const content_sorted = [...content].sort((a: Content, b: Content) =>
		a.title.localeCompare(b.title),
	);

	while (end >= start) {
		let middle = Math.floor((end + start) / 2);
		const serie_title = prepareComparisonString(content_sorted[middle].title);

		if (checkSimilar(serie_title, compare) === 100) {
			return content_sorted[middle];
		}

		if (
			compare === serie_title ||
			compare.match(new RegExp(`\\b${serie_title}\\b`))
		) {
			return content_sorted[middle];
		}

		if (compare.localeCompare(serie_title) < 0) {
			end = middle - 1;
		} else {
			start = middle + 1;
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

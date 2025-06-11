import type { QBittorrent } from "@ctrl/qbittorrent";
import { timeLogs, TimeLogsQueue } from "../Logs/logs.js";
import { isString, isValidObject, undesiredExtentionsParser } from "./utils.js";
import type { Torrents } from "../types.js";

const queue = new TimeLogsQueue();

/**
 * Removes torrents with undesired extensions.
 * @param torrrent_cliente - The qBittorrent client.
 * @param torrents - The list of torrents.
 * @returns A promise that resolves to a list of filtered torrents.
 */
export const removeTorrentsUndesiredExtentions = async (
  torrrent_cliente: QBittorrent,
  torrents: Torrents[],
): Promise<Torrents[]> => {
  const undesiredExtentions = undesiredExtentionsParser();

  if (undesiredExtentions.length === 0) {
    return torrents;
  }

  const filteredTorrents: Torrents[] = [];

  for (const torrent of torrents) {
    const torrent_contents = await torrrent_cliente.torrentFiles(torrent.hash);
    let remove = false;
    let file_name = "";
    for (const file of torrent_contents) {
      if (undesiredExtentions.some((el) => file.name.includes(el))) {
        file_name = file.name;
        remove = true;
        break;
      }
    }
    if (remove) {
      const log = `unwanted extention found | Removing Torrent ${file_name}`;
      queue.onqueue(timeLogs(log, log));
      await torrrent_cliente.removeTorrent(torrent.hash);
    } else {
      filteredTorrents.push(torrent);
    }
  }

  return filteredTorrents;
};

/**
 * Returns a list of torrents from the given data.
 * @param data - The data to extract torrents from.
 * @returns A list of torrents.
 */
export const returnTorrentList = (data: unknown): Torrents[] => {
  if (!isValidObject(data) || !("raw" in data) || !Array.isArray(data.raw))
    return [];

  const torrents = data.raw.reduce<Torrents[]>((prev, item) => {
    if (!isValidObject(item)) return prev;

    const record = item as Record<string, unknown>;

    if (
      (record.category === "tv-sonarr" || record.category === "radarr") &&
      (record.save_path === "/downloads/tv-sonarr" ||
        record.save_path === "/downloads/radarr")
    ) {
      prev.push({
        hash: isString(record.hash),
        name: isString(record.name),
        content_path: isString(record.content_path),
      });
    }

    return prev;
  }, []);

  return torrents;
};

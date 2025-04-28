export type MissingType = {
  page: number;
  pageSize: number;
  totalRecords: number;
  records: MissingSeriesRecordType[];
};

export type MissingSeriesRecordType = {
  seriesId: number;
  airDate: string;
  airDateUtc: string;
  lastSearchTime: string;
  id: number;
};

export type Movies = {
  id: number;
  title: string;
  path: string;
  movieFileId?: number;
  movieFile?: {
    path: string;
    relativePath: string;
  };
  alternateTitles: {
    title: string;
  }[];
};

export type Series = {
  id: number;
  title: string;
  path: string;
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

import { renameRadarrMovies } from "./Movies/renameMovies.js";
import { renameSeriesEps } from "./Series/renameEps.js";

await renameSeriesEps();
await renameRadarrMovies();

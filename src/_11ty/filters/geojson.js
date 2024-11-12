import { lineString, bbox as turfBbox } from "@turf/turf";

export const bbox = (geojson) => {
	const line = lineString(geojson);
	return turfBbox(line);
};

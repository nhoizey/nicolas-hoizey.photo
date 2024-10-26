import { bbox as turfBbox, lineString } from '@turf/turf';

export const bbox = (geojson) => {
	const line = lineString(geojson);
	return turfBbox(line);
};

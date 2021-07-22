const turf = require('@turf/turf');

module.exports = {
  bbox: (geojson) => {
    const line = turf.lineString(geojson);
    return turf.bbox(line);
  },
};

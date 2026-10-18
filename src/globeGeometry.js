export function countryOutlinePositions(features, radius) {
  const positions = [];
  const point = ([lng, lat]) => {
    const latitude = lat * Math.PI / 180;
    const longitude = lng * Math.PI / 180;
    const parallel = radius * Math.cos(latitude);
    return [parallel * Math.sin(longitude), radius * Math.sin(latitude), parallel * Math.cos(longitude)];
  };
  for (const feature of features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (let i = 1; i < ring.length; i++) positions.push(...point(ring[i - 1]), ...point(ring[i]));
      }
    }
  }
  return new Float32Array(positions);
}

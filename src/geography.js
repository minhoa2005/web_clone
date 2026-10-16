let request;

export function loadGeography() {
  if (!request) {
    request = fetch(`${import.meta.env.BASE_URL}assets/world-simple.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được bản đồ');
        return response.json();
      }).catch((error) => { request = null; throw error; });
  }
  return request;
}

export function mapPath(feature) {
  return feature.geometry.coordinates.flatMap((polygon) => polygon.map((ring) => ring.map((point, index) => {
    const jump = index > 0 && Math.abs(point[0] - ring[index - 1][0]) > 180;
    return `${index === 0 || jump ? 'M' : 'L'}${((point[0] + 180) * 2.7778).toFixed(1)},${((90 - point[1]) * 2.7778).toFixed(1)}`;
  }).join(' '))).join(' ');
}

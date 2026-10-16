"""Prepare lightweight orientation geometry and cited pages from the supplied PDF."""
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'assets'


def simplify(points, tolerance):
    if len(points) < 4:
        return points
    ax, ay = points[0][:2]
    bx, by = points[-1][:2]
    dx, dy = bx - ax, by - ay
    denominator = dx * dx + dy * dy
    distance, index = 0, 0
    for i, point in enumerate(points[1:-1], 1):
        t = max(0, min(1, ((point[0] - ax) * dx + (point[1] - ay) * dy) / denominator)) if denominator else 0
        candidate = (point[0] - ax - t * dx) ** 2 + (point[1] - ay - t * dy) ** 2
        if candidate > distance:
            distance, index = candidate, i
    if distance > tolerance * tolerance:
        return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)
    return [points[0], points[-1]]


original = json.loads((ASSETS / 'countries-50m.geojson').read_text(encoding='utf-8'))
features = []
for feature in original['features']:
    geometry = feature['geometry']
    polygons = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
    result = []
    for polygon in polygons:
        rings = []
        for ring in polygon:
            reduced = simplify(ring, .28)
            if len(reduced) >= 4:
                rings.append([[round(point[0], 3), round(point[1], 3)] for point in reduced])
        if rings:
            result.append(rings)
    if result:
        features.append({'type': 'Feature', 'properties': {}, 'geometry': {'type': 'MultiPolygon', 'coordinates': result}})
destination = ASSETS / 'world-simple.json'
destination.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')), encoding='utf-8')
print(f'Orientation geometry: {destination.stat().st_size:,} bytes, {len(features)} features')

pages = [38, 49, 50, 51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 71, 78, 79, 81, 82, 95, 96, 97, 98, 111, 112, 113, 114, 115, 116, 117, 118, 140, 155, 156, 159, 160, 169, 170, 171, 172, 173, 174, 175, 193, 194, 216, 217, 227, 228, 231, 232, 233, 239, 240, 241, 242, 243, 244, 245, 246, 247, 259, 260, 261, 262, 274, 275, 276, 277, 285, 286, 287, 342, 343, 344, 367, 368, 369, 390, 391, 392, 393, 394]
document = PdfReader(ROOT / 'docs' / 'Giao trinh lich su dang cong san viet nam.pdf')
destination = ASSETS / 'sources'
destination.mkdir(exist_ok=True)
for page in pages:
    image = list(document.pages[page - 1].images)[0].image.convert('RGB')
    image.thumbnail((840, 1200))
    image.save(destination / f'page-{page}.webp', quality=82)
(destination / 'ATTRIBUTION.md').write_text('# Source pages\n\nExtracted from the user-supplied Ministry of Education and Training textbook, Giao trinh Lich su Dang Cong san Viet Nam, NXB Chinh tri quoc gia Su that, Hanoi, 2021. Filename numbers match the inspected printed/PDF pages. These are textbook reproductions, not independent archival photographs. The original PDF remains in docs/. No generated historical imagery is used. The orientation geometry is a simplified derivative of the existing countries-50m.geojson asset and does not represent historical boundaries.\n', encoding='utf-8')
print(f'Prepared {len(pages)} cited textbook pages')

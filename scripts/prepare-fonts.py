"""Self-host the Vietnamese and Latin subsets provided by Google Fonts."""
import re
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
destination = root / 'public' / 'assets' / 'fonts'
destination.mkdir(exist_ok=True)
url = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Noto+Serif:ital,wght@0,400;0,500;1,400&display=swap'
request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'})
css = urllib.request.urlopen(request).read().decode()
blocks = re.findall(r'/\* ([^*]+) \*/\s*(@font-face\s*\{[^}]+\})', css)
css = '\n'.join(f'/* {subset} */\n{block}' for subset, block in blocks if subset in ['latin', 'latin-ext', 'vietnamese'])
if not css:
    raise RuntimeError('Expected Google Fonts subset declarations')
for index, font_url in enumerate(dict.fromkeys(re.findall(r'url\((https[^)]+)\)', css))):
    name = f'subset-{index}.woff2'
    (destination / name).write_bytes(urllib.request.urlopen(font_url).read())
    css = css.replace(font_url, f'../public/assets/fonts/{name}')
(root / 'src' / 'fonts.css').write_text(css, encoding='utf-8')
print('Font CSS updated to local Latin and Vietnamese WOFF2 subsets')

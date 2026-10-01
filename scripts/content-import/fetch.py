"""Reads the public data feeds of the current flokefama.com (read only: nothing is ever written to the live site)
into scripts/content-import/.cache/, for import_catalogue.py and import_news.py."""
import os, urllib.request

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cache')
os.makedirs(HERE, exist_ok=True)
FEEDS = {
    'products-1.json': 'https://flokefama.com/wp-json/wc/store/v1/products?per_page=100&page=1',
    'posts.json': 'https://flokefama.com/wp-json/wp/v2/posts?per_page=100&_embed=1',
}
for name, url in FEEDS.items():
    urllib.request.urlretrieve(url, os.path.join(HERE, name))
    print('fetched', name)

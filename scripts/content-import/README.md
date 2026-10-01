# Content import from the current flokefama.com

The Shop catalogue (`src/data/catalogue.ts`, 92 products, images in `public/images/products/`) and the
News, Blog & Press articles (`src/data/articles.ts`, images in `public/images/news/`) are generated from the
current site's public data feeds. **The live site is only read; nothing is ever written to it.**

```bash
python3 scripts/content-import/fetch.py            # read the WooCommerce and WordPress feeds
python3 scripts/content-import/import_catalogue.py # → src/data/catalogue.ts + product images
python3 scripts/content-import/import_news.py      # → src/data/articles.ts + article images
```

Needs Python 3 and the repo's `node_modules` (images are converted to WebP with sharp). Existing images are
kept; delete one to re-download it. Product key features come from the Flokefama brochure and are listed in
`BROCHURE` in `import_catalogue.py`. How shop categories map to the five Shop categories is in `CATEGORY` and
`OTHERS` in the same file.

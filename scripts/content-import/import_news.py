"""Builds src/data/articles.ts from the posts on the current flokefama.com (WordPress REST API, read only).
Article text is kept verbatim; formatting is reduced to headings, paragraphs (with bold/italic/links), lists,
quotes and images. Images are saved as WebP in public/images/news/."""
import html, json, os, re, subprocess, urllib.request
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cache')
os.makedirs(HERE, exist_ok=True)
IMG_DIR = f'{ROOT}/public/images/news'
os.makedirs(IMG_DIR, exist_ok=True)
posts = json.load(open(f'{HERE}/posts.json'))


def save_image(url, name, width=1400):
    dest = f'{IMG_DIR}/{name}.webp'
    if not os.path.exists(dest):
        raw = f'{HERE}/news-{name}'
        urllib.request.urlretrieve(url, raw)
        subprocess.run(['node', '-e', f"require('{ROOT}/node_modules/sharp')('{raw}').rotate().resize({{width:{width},withoutEnlargement:true}}).webp({{quality:78}}).toFile('{dest}')"], check=True)
    out = subprocess.run(['node', '-e', f"require('{ROOT}/node_modules/sharp')('{dest}').metadata().then(m=>console.log(m.width+' '+m.height))"], capture_output=True, text=True, check=True).stdout.split()
    return f'/images/news/{name}.webp', int(out[0]), int(out[1])


class Content(HTMLParser):
    """Turns post HTML into blocks: h, p (runs), ul/ol (items of runs), quote (runs), img."""
    def __init__(self, slug):
        super().__init__(convert_charrefs=True)
        self.slug = slug; self.blocks = []; self.runs = []; self.fmt = {'b': 0, 'i': 0}; self.href = None
        self.mode = None; self.list = None; self.items = []; self.heading = False; self.imgs = 0; self.sup = 0

    def text_of(self, runs):
        return ''.join(r['t'] for r in runs).strip()

    def flush(self):
        runs = self.tidy(self.runs); self.runs = []
        if not runs: return
        t = self.text_of(runs)
        if not t: return
        if self.heading:
            self.blocks.append({'type': 'h', 'text': t})
        elif self.list is not None:
            self.items.append(runs)
        elif self.mode == 'quote':
            self.blocks.append({'type': 'quote', 'runs': runs})
        elif all(r.get('b') for r in runs if r['t'].strip()) and len(t) < 90 and not t.endswith('.'):
            # a short line that is entirely bold reads as a sub-heading on the original
            self.blocks.append({'type': 'h', 'text': t})
        else:
            self.blocks.append({'type': 'p', 'runs': runs})

    def tidy(self, runs):
        out = []
        for r in runs:
            r = dict(r); r['t'] = re.sub(r'\s+', ' ', r['t'])
            if out and {k: v for k, v in out[-1].items() if k != 't'} == {k: v for k, v in r.items() if k != 't'}:
                out[-1]['t'] += r['t']
            else:
                out.append(r)
        if out: out[0]['t'] = out[0]['t'].lstrip(); out[-1]['t'] = out[-1]['t'].rstrip()
        return [r for r in out if r['t']]

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('p', 'figure'): self.flush()
        elif tag in ('h1', 'h2', 'h3', 'h4', 'h5'): self.flush(); self.heading = True
        elif tag == 'br': self.flush()
        elif tag in ('strong', 'b'): self.fmt['b'] += 1
        elif tag in ('em', 'i'): self.fmt['i'] += 1
        elif tag == 'sup': self.sup += 1
        elif tag == 'a':
            h = a.get('href', '')
            self.href = h if h.startswith('http') and 'flokefama.com' not in h else None
        elif tag in ('ul', 'ol'): self.flush(); self.list = tag; self.items = []
        elif tag == 'li': self.flush()
        elif tag == 'blockquote': self.flush(); self.mode = 'quote'
        elif tag == 'img':
            self.flush(); self.imgs += 1
            src, w, h = save_image(a['src'], f'{self.slug}-{self.imgs}')
            self.blocks.append({'type': 'img', 'src': src, 'alt': html.unescape(a.get('alt') or ''), 'width': w, 'height': h})

    def handle_endtag(self, tag):
        if tag in ('p', 'li', 'figure'): self.flush()
        elif tag in ('h1', 'h2', 'h3', 'h4', 'h5'): self.flush(); self.heading = False
        elif tag in ('strong', 'b'): self.fmt['b'] -= 1
        elif tag in ('em', 'i'): self.fmt['i'] -= 1
        elif tag == 'sup': self.sup -= 1
        elif tag == 'a': self.href = None
        elif tag in ('ul', 'ol'):
            self.flush()
            if self.items: self.blocks.append({'type': self.list, 'items': self.items})
            self.list = None; self.items = []
        elif tag == 'blockquote': self.flush(); self.mode = None

    def handle_data(self, data):
        if self.sup: data = data  # ordinals like 13th: keep the text inline
        r = {'t': data}
        if self.fmt['b'] > 0: r['b'] = True
        if self.fmt['i'] > 0: r['i'] = True
        if self.href: r['href'] = self.href
        self.runs.append(r)


out = []
for p in posts:
    slug = p['slug']
    c = Content(slug); c.feed(p['content']['rendered']); c.flush()
    cats = [html.unescape(t['name']) for grp in p['_embedded'].get('wp:term', []) for t in grp if t['taxonomy'] == 'category']
    cats = [x for x in cats if x != 'Uncategorized'] or ['News']
    fm = (p['_embedded'].get('wp:featuredmedia') or [{}])[0]
    image = None
    if fm.get('source_url'):
        src, w, h = save_image(fm['source_url'], f'{slug}-cover', 1600)
        image = {'src': src, 'alt': html.unescape(fm.get('alt_text') or '') or html.unescape(p['title']['rendered']), 'width': w, 'height': h}
    # Excerpt: the opening paragraphs, cut at a word boundary
    lead = ' '.join(''.join(r['t'] for r in b['runs']) for b in c.blocks if b['type'] == 'p')
    excerpt = lead if len(lead) <= 200 else lead[:200].rsplit(' ', 1)[0].rstrip(',;:') + '…'
    out.append({
        'slug': slug,
        'title': html.unescape(p['title']['rendered']),
        'date': p['date'][:10],
        'categories': cats,
        'excerpt': excerpt,
        'image': image,
        'blocks': c.blocks,
        'source': p['link'].replace('https://flokefama.com', ''),
    })

out.sort(key=lambda a: a['date'], reverse=True)
src = ['/* Generated from the posts on the current flokefama.com by the news import. Do not edit by hand: titles, dates,',
       ' * categories, text and images are as published there. `source` is the post\'s path on the current site (used for redirects). */',
       '', 'export type Run = { t: string; b?: boolean; i?: boolean; href?: string };',
       'export type Block =',
       "  | { type: 'h'; text: string }",
       "  | { type: 'p' | 'quote'; runs: Run[] }",
       "  | { type: 'ul' | 'ol'; items: Run[][] }",
       "  | { type: 'img'; src: string; alt: string; width: number; height: number };",
       'export type Article = { slug: string; title: string; date: string; categories: string[]; excerpt: string; image?: { src: string; alt: string; width: number; height: number }; blocks: Block[]; source: string };',
       '', 'export const articles: Article[] = ' + json.dumps([{k: v for k, v in a.items() if v is not None} for a in out], indent=2, ensure_ascii=False) + ';', '']
open(f'{ROOT}/src/data/articles.ts', 'w').write('\n'.join(src))
for a in out: print(a['date'], a['slug'][:50], len(a['blocks']), 'blocks', a['categories'])

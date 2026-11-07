"""
Saves a copy of the old Flokefama WordPress site, which still runs on its old server (178.62.61.11) although
flokefama.com now shows the new site. Run on a Mac:  curl -sL <raw link to this file> | python3
It puts every page, picture, style and script in a zip on the Desktop: old-flokefama-site.zip. Nothing is changed
on the computer or on any server; it only downloads.
"""
import html, os, queue, re, shutil, subprocess, threading, sys
from urllib.parse import unquote, urljoin, urlparse

OLD_SERVER = '178.62.61.11'
HOST = 'flokefama.com'
DESK = os.path.expanduser('~/Desktop')
OUT = os.path.join(DESK, 'old-flokefama-site')
SKIP = re.compile(r'/(wp-admin|wp-login|wp-json|xmlrpc|feed|my-account|cart|checkout|wp-cron)|add-to-cart|/embed/?$|/trackback|/page/\d{3,}', re.I)
ASSET = re.compile(r'\.(css|js|woff2?|ttf|otf|eot|svg|png|jpe?g|webp|gif|ico|avif|mp4|pdf)$', re.I)

seen, lock, q, fails = set(), threading.Lock(), queue.Queue(), []

def norm(u):
    p = urlparse(u)
    if p.netloc not in (HOST, 'www.' + HOST) or p.scheme not in ('http', 'https'):
        return None
    path = unquote(p.path) or '/'
    if ' ' in path.strip('/') and not ASSET.search(path):
        return None
    if SKIP.search(path) or (p.query and not ASSET.search(path)):
        return None
    return 'https://' + HOST + path

def local(path):
    last = path.rstrip('/').split('/')[-1]
    # Pages (including WordPress's index.php/… addresses) become folders with an index.html
    if path.endswith('/') or last.lower().endswith('.php') or not re.search(r'\.[a-z0-9]{2,5}$', last, re.I):
        return path.rstrip('/') + '/index.html'
    return path

def fetch(u):
    r = subprocess.run(
        ['curl', '-s', '-m', '60', '-L', '--max-redirs', '4',
         '--resolve', f'{HOST}:443:{OLD_SERVER}', '--resolve', f'www.{HOST}:443:{OLD_SERVER}',
         '--resolve', f'{HOST}:80:{OLD_SERVER}', '--resolve', f'www.{HOST}:80:{OLD_SERVER}',
         '-A', 'Mozilla/5.0 (Macintosh) old-site-backup', '-w', '\n%{http_code} %{content_type}', u],
        capture_output=True)
    body, _, tail = r.stdout.rpartition(b'\n')
    code, _, ctype = tail.decode(errors='ignore').partition(' ')
    return code, ctype, body

def add(u):
    n = norm(u)
    if n:
        with lock:
            if n in seen:
                return
            seen.add(n)
        q.put(n)

def work():
    while True:
        u = q.get()
        try:
            code, ctype, body = fetch(u)
            if code != '200':
                fails.append((code, u))
                continue
            dest = OUT + local(urlparse(u).path)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, 'wb') as f:
                f.write(body)
            n = len(seen) - q.qsize()
            if n % 25 == 0:
                print(f'  {n} files saved…', flush=True)
            if any(t in ctype for t in ('html', 'css', 'xml')):
                text = body.decode('utf-8', errors='ignore').replace('\\/', '/')
                if 'css' not in ctype:
                    for m in re.finditer(r'(?:href|src|data-src|data-bg|data-lazy-src|poster)=["\']([^"\']+)', text):
                        add(urljoin(u, html.unescape(m.group(1))))
                    for m in re.finditer(r'(?:srcset|data-srcset)=["\']([^"\']+)', text):
                        for part in m.group(1).split(','):
                            add(urljoin(u, part.strip().split(' ')[0]))
                    for m in re.finditer(r'https?://(?:www\.)?flokefama\.com/[^\s"\'<>)\\]+', text):
                        add(m.group(0))
                for m in re.finditer(r'url\(\s*["\']?([^"\')]+)', text):
                    add(urljoin(u, m.group(1)))
        except Exception as e:
            fails.append(('error', f'{u} ({e})'))
        finally:
            q.task_done()

def main():
    code, _, body = fetch('https://flokefama.com/')
    if code != '200' or b'wp-content' not in body:
        sys.exit('The old server did not send the old site (it may have been switched off). Nothing was saved.')
    shutil.rmtree(OUT, ignore_errors=True)
    print('Saving the old Flokefama website. This takes a few minutes…', flush=True)
    for s in ['https://flokefama.com/', 'https://flokefama.com/sitemap_index.xml', 'https://flokefama.com/wp-sitemap.xml', 'https://flokefama.com/robots.txt']:
        add(s)
    for _ in range(8):
        threading.Thread(target=work, daemon=True).start()
    q.join()
    pages = sum(1 for _, _, fs in os.walk(OUT) for f in fs if f == 'index.html')
    files = sum(len(fs) for _, _, fs in os.walk(OUT))
    zip_path = shutil.make_archive(OUT, 'zip', OUT)
    size = os.path.getsize(zip_path) / 1e6
    print(f'\nDone: {pages} pages, {files} files in total. Not found or skipped: {len(fails)}.')
    print(f'Saved to your Desktop: old-flokefama-site.zip ({size:.0f} MB). Send this zip to Claude.')

main()

# python3 render.py out/<slug>/print.html  -> out/<slug>/calendar.pdf (+ page PNGs for checking)
import sys, os
from playwright.sync_api import sync_playwright
src = os.path.abspath(sys.argv[1]); d = os.path.dirname(src)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1056, 'height': 816})
    pg.goto('file://' + src); pg.wait_for_timeout(800)
    pg.pdf(path=os.path.join(d, 'calendar.pdf'), width='11in', height='8.5in', print_background=True, prefer_css_page_size=True)
    n = pg.locator('.page').count()
    for i in range(n): pg.locator('.page').nth(i).screenshot(path=os.path.join(d, f'page-{i+1:02d}.png'))
    b.close()
print(os.path.join(d, 'calendar.pdf'), n, 'pages')

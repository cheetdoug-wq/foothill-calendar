# Business cards, 10 to a Letter sheet:
#   python3 maker/reels/render-cards.py cards.pdf   (also writes a .png preview beside it)
import os, sys, threading, http.server, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT); h.log_message = lambda *a: None
s = http.server.ThreadingHTTPServer(('127.0.0.1', 8795), h)
threading.Thread(target=s.serve_forever, daemon=True).start()
out = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', args=['--no-sandbox'])
    pg = b.new_context(viewport={'width': 816, 'height': 1056}, device_scale_factor=2).new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8795/maker/reels/cards.html')
    pg.wait_for_function('window.CARDS_READY && document.fonts.status === "loaded"')
    pg.evaluate('document.getAnimations().forEach(a=>{a.pause();a.currentTime=300})')
    pg.locator('#sheet').screenshot(path=os.path.splitext(out)[0] + '.png')
    pg.pdf(path=out, width='8.5in', height='11in', print_background=True,
           margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
    print(out, 'errors', errs); b.close()

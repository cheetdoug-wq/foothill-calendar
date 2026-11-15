# Screenshot a post page as a 1080x1350 Instagram image:
#   python3 maker/reels/render-post.py out.png          (post.html, the dog calendar)
#   python3 maker/reels/render-post.py post2 out.png    (post2.html, the notifications)
import threading, http.server, functools, sys
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
h=functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT); h.log_message=lambda *a: None
s=http.server.ThreadingHTTPServer(('127.0.0.1',8794),h); threading.Thread(target=s.serve_forever,daemon=True).start()
page = next((a for a in sys.argv[1:] if not a.endswith('.png')), 'post')
out = next(a for a in sys.argv[1:] if a.endswith('.png'))
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':540,'height':675},device_scale_factor=2).new_page()
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8794/maker/reels/' + page + '.html')
    pg.wait_for_function('window.POST_READY && document.fonts.status==="loaded"')
    pg.evaluate('document.getAnimations().forEach(a=>{a.pause();a.currentTime=300})')
    pg.locator('#card').screenshot(path=out)
    print(out,'errors',errs); b.close()

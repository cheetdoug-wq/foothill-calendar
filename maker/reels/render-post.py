# Screenshot post.html as a 1080x1350 Instagram image:  python3 maker/reels/render-post.py out.png
import threading, http.server, functools, sys
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
h=functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT); h.log_message=lambda *a: None
s=http.server.ThreadingHTTPServer(('127.0.0.1',8794),h); threading.Thread(target=s.serve_forever,daemon=True).start()
out=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':540,'height':675},device_scale_factor=2).new_page()
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8794/maker/reels/post.html')
    pg.wait_for_function('window.POST_READY && document.fonts.status==="loaded"')
    pg.evaluate('document.getAnimations().forEach(a=>{a.pause();a.currentTime=300})')
    pg.locator('#card').screenshot(path=out)
    print(out,'errors',errs); b.close()

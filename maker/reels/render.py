# Render the Instagram Reels to media/reel1.mp4, reel2.mp4, reel3.mp4.
#   python3 maker/reels/render.py            -> all three
#   python3 maker/reels/render.py 2          -> just reel 2
#   python3 maker/reels/render.py 2 music.mp3 -> reel 2 with a music track mixed in
# Needs: pip install playwright, Chrome or Chromium, ffmpeg.
# It steps the page one exact frame at a time (30 a second), so there are no dropped or
# repeated frames, and encodes at high quality so Instagram has a clean file to compress.
import os, sys, subprocess, threading, http.server, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FPS, PORT = 30, 8791

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

def render(pg, n, music=None):
    out = os.path.join(ROOT, 'media', f'reel{n}.mp4')
    pg.goto(f'http://127.0.0.1:{PORT}/maker/reels/reel.html?r={n}')
    pg.wait_for_function('window.REEL && document.fonts.status === "loaded"')
    pg.evaluate('Promise.all([].map.call(document.images, i => i.decode()))')
    dur = pg.evaluate('REEL.dur'); frames = round(dur * FPS)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'png', '-i', '-']
    if music: cmd += ['-stream_loop', '-1', '-i', music]
    else: cmd += ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']
    cmd += ['-map', '0:v', '-map', '1:a', '-t', f'{dur}',
            '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-r', str(FPS),
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-g', str(FPS * 2),
            '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
            '-af', f'afade=t=in:d=0.4,afade=t=out:st={dur - 1.2}:d=1.2', '-c:a', 'aac', '-b:a', '192k',
            '-movflags', '+faststart', out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(frames):
        pg.evaluate('t => REEL.seek(t)', i / FPS)
        ff.stdin.write(pg.screenshot(type='png', clip={'x': 0, 'y': 0, 'width': 540, 'height': 960}))
    ff.stdin.close(); ff.wait()
    print(out, f'{frames} frames, {dur}s', 'with music' if music else 'silent track')

if __name__ == '__main__':
    which = [int(sys.argv[1])] if len(sys.argv) > 1 else [1, 2, 3]
    music = sys.argv[2] if len(sys.argv) > 2 else None
    srv = serve()
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel='chrome', args=['--no-sandbox'])
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2).new_page()
        for n in which: render(pg, n, music)
        b.close()
    srv.shutdown()

# Render the Instagram Reels to media/reel1.mp4 ... reel6.mp4.
#   python3 maker/reels/render.py            -> all of them
#   python3 maker/reels/render.py 4 5 6      -> just those
#   python3 maker/reels/render.py 2 music.mp3 -> reel 2 with a music track mixed in
# Sound effects are synthesized by sfx.py and mixed in automatically; music, if given, sits under them.
# Needs: pip install playwright, Chrome or Chromium, ffmpeg.
# It steps the page one exact frame at a time (30 a second), so there are no dropped or
# repeated frames, and encodes at high quality so Instagram has a clean file to compress.
import os, sys, subprocess, threading, http.server, functools, tempfile
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sfx as SFX  # noqa: E402  -- needs HERE on sys.path
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
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
    # sound effects: synthesized here, never sampled (see sfx.py)
    cues = [tuple(c) for c in pg.evaluate('REEL.sfx')]
    bed = os.path.join(tempfile.gettempdir(), f'reel{n}-sfx.wav') if cues else None
    if bed: SFX.build(cues, dur, bed)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-']
    if music: cmd += ['-stream_loop', '-1', '-i', music]
    if bed: cmd += ['-i', bed]
    if not music and not bed: cmd += ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']
    if music and bed:
        # music sits under the effects
        cmd += ['-filter_complex', '[1:a]volume=0.55[m];[2:a]volume=1.0[s];[m][s]amix=inputs=2:duration=first:dropout_transition=0[a]', '-map', '0:v', '-map', '[a]']
    else:
        cmd += ['-map', '0:v', '-map', '1:a']
    cmd += ['-t', f'{dur}',
            '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-color_range', 'tv', '-r', str(FPS),
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-g', str(FPS * 2),
            '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
            '-af', f'afade=t=in:d=0.4,afade=t=out:st={dur - 1.2}:d=1.2', '-c:a', 'aac', '-b:a', '192k',
            '-movflags', '+faststart', out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(frames):
        pg.evaluate('t => REEL.seek(t)', i / FPS)
        ff.stdin.write(pg.screenshot(type='jpeg', quality=95, clip={'x': 0, 'y': 0, 'width': 540, 'height': 960}))
    ff.stdin.close(); ff.wait()
    print(out, f'{frames} frames, {dur}s,', f'{len(cues)} sound effects,', 'music' if music else 'no music')

if __name__ == '__main__':
    which = [int(a) for a in sys.argv[1:] if a.isdigit()] or [1, 2, 3, 4, 5, 6, 7, 8]
    music = next((a for a in sys.argv[1:] if not a.isdigit()), None)
    srv = serve()
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel='chrome', args=['--no-sandbox'])
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=2).new_page()
        for n in which: render(pg, n, music)
        b.close()
    srv.shutdown()

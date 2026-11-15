# Sound effects for the Reels, synthesized from scratch with numpy.
# Nothing is sampled or downloaded: every sound here is built out of sine waves,
# noise and envelopes, so there is nothing to buy and nothing to credit.
#
#   python3 maker/reels/sfx.py demo.wav     -> a wav with one of each sound, to listen to
#
# render.py calls build() to lay these out along a reel's timeline.
import sys
import numpy as np
from scipy import signal

SR = 48000


def _t(dur):
    return np.linspace(0, dur, int(SR * dur), endpoint=False)


def _env(n, attack=0.004, decay=0.25, curve=3.0):
    """Fast attack, exponential fall."""
    a = max(1, int(SR * attack))
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    fall = np.linspace(0, 1, max(1, n - a))
    e[a:] = np.exp(-curve * fall / max(decay, 1e-6) * decay * 4)
    return e


def _bell(freq, dur=0.9, partials=(1, 2.76, 5.4, 8.9), gains=(1, .5, .28, .14)):
    """Inharmonic partials with their own decay rates: reads as a struck bell."""
    t = _t(dur)
    out = np.zeros_like(t)
    for p, g in zip(partials, gains):
        out += g * np.sin(2 * np.pi * freq * p * t) * np.exp(-t * (2.2 + p * 0.9))
    return out / (np.max(np.abs(out)) + 1e-9)


def pop(freq=520.0, dur=0.13):
    """Short blip with a falling pitch: a card or caption landing."""
    t = _t(dur)
    f = freq * np.exp(-t * 11) + 110
    w = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return w * _env(len(t), 0.002, 0.07, 5)


def tick(freq=1900.0, dur=0.05):
    """Tiny bright click for a line of text appearing."""
    t = _t(dur)
    w = np.sin(2 * np.pi * freq * t) * np.exp(-t * 90)
    return w * 0.7


def whoosh(dur=0.45, up=True):
    """Filtered noise swept in pitch: a scene change."""
    n = int(SR * dur)
    noise = np.random.default_rng(7).standard_normal(n) * 0.5
    out = np.zeros(n)
    step = 1024
    for i in range(0, n, step):
        chunk = noise[i:i + step]
        if not len(chunk):
            break
        k = i / max(n - 1, 1)
        centre = (420 + 2600 * k) if up else (3000 - 2500 * k)
        lo = max(80.0, centre * 0.55) / (SR / 2)
        hi = min(0.98, centre * 1.7 / (SR / 2))
        if hi <= lo:
            hi = min(0.99, lo + 0.05)
        b, a = signal.butter(2, [lo, hi], btype='band')
        out[i:i + step] = signal.lfilter(b, a, chunk)
    env = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return out / (np.max(np.abs(out)) + 1e-9) * env


def boing(dur=0.42):
    """Cartoon spring, for a punchline."""
    t = _t(dur)
    f = 320 * np.exp(-t * 5) + 90 + 42 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3)
    w = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR, 0.5)
    return w * _env(len(t), 0.004, 0.2, 4) * 0.8


def thud(dur=0.34):
    """Soft low landing, for something dropping into place."""
    t = _t(dur)
    f = 150 * np.exp(-t * 18) + 48
    w = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return w * _env(len(t), 0.003, 0.16, 4)


def chime(freq=880.0):
    return _bell(freq, 1.1) * 0.75


def sparkle(dur=0.85):
    """A little scatter of high bells: the animation starting."""
    out = np.zeros(int(SR * dur))
    rng = np.random.default_rng(3)
    for i, f in enumerate([1320, 1760, 2093, 2637, 3136]):
        b = _bell(f, dur * 0.8) * (0.5 - i * 0.06)
        at = int(SR * (0.03 + rng.random() * 0.3))
        end = min(len(out), at + len(b))
        out[at:end] += b[:end - at]
    return out / (np.max(np.abs(out)) + 1e-9) * 0.7


def scan(dur=1.1):
    """Rising tone with a confirming blip: the QR code being read."""
    t = _t(dur)
    f = np.linspace(500, 1500, len(t))
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    w *= np.clip(np.sin(np.linspace(0, np.pi, len(t))) * 1.4, 0, 1)
    tail = _bell(1760, 0.5) * 0.6
    out = np.zeros(len(t) + len(tail))
    out[:len(t)] = w
    out[len(t):] += tail
    return out


def jingle():
    """Four rising bells for the end card."""
    notes = [587.33, 739.99, 880.0, 1174.66]
    gap = int(SR * 0.16)
    out = np.zeros(gap * len(notes) + SR)
    for i, f in enumerate(notes):
        b = _bell(f, 1.2) * (0.55 + i * 0.07)
        at = i * gap
        out[at:at + len(b)] += b[:len(out) - at]
    return out / (np.max(np.abs(out)) + 1e-9) * 0.8


SOUNDS = {
    'pop': pop, 'tick': tick, 'whoosh': whoosh, 'boing': boing, 'thud': thud,
    'chime': chime, 'sparkle': sparkle, 'scan': scan, 'jingle': jingle,
}


def build(cues, duration, path):
    """cues = [(seconds, 'name', gain), ...] -> a stereo wav of the whole reel."""
    n = int(SR * duration) + SR
    bed = np.zeros(n)
    for cue in cues:
        at, name = cue[0], cue[1]
        gain = cue[2] if len(cue) > 2 else 1.0
        if name not in SOUNDS:
            continue
        s = SOUNDS[name]() * gain
        i = int(SR * at)
        end = min(n, i + len(s))
        if end > i:
            bed[i:end] += s[:end - i]
    peak = np.max(np.abs(bed))
    if peak > 0.9:
        bed *= 0.9 / peak
    bed = bed[:int(SR * duration)]
    stereo = np.stack([bed, bed], axis=1)
    data = (np.clip(stereo, -1, 1) * 32767).astype('<i2')
    import wave
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    return path


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'sfx-demo.wav'
    cues = [(i * 1.3, name, 1.0) for i, name in enumerate(SOUNDS)]
    build(cues, len(SOUNDS) * 1.3 + 1.5, out)
    print(out, 'one of each:', ', '.join(SOUNDS))

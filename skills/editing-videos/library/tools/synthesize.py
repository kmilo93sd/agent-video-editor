"""Synthesizes the 29 generated sounds of the library (dedicated to CC0).

Usage:
    python synthesize.py --out <dir> [--sources <dir>]

Needs Python 3 with numpy, and ffmpeg on the PATH (only to decode the CC0 sources of the composites).
Writes raw 16-bit WAV files at 48 kHz, peak-normalized to -6 dBFS, one per sound, named by catalog id.
Seeds are fixed, so the output is the same on every run.

--sources is a folder with these CC0 downloads unzipped inside it (any layout; files are found by name):
    Kenney rpg-audio, ui-audio and impact-sounds (kenney.nl), the unicaegames keyboard soundpack and
    Luckius' "Various Paper Sound Effects" (OpenGameArt.org). URLs are in ../LICENSES.md.
Without --sources only the 25 pure-synthesis sounds are written; the 4 composites are skipped.

The raw files are not the library files yet: they still get the library's processing (trim, fades,
loudness to -22 LUFS with a -1 dBTP ceiling, limiter rule), described in ../LICENSES.md and in the
`criteria` block of ../catalog.json.
"""
import argparse, os, subprocess, wave
import numpy as np

SR = 48000
GEN = None
SRC = None


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def source(name):
    """Finds a CC0 source file by name anywhere under --sources."""
    for d, _, files in os.walk(SRC):
        if name in files:
            return os.path.join(d, name)
    raise FileNotFoundError(f"{name} is not under {SRC}; see the docstring for the downloads it needs")


def save(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    peak = np.max(np.abs(x)) or 1.0
    x = x / peak * 0.5
    data = (x * 32767).astype("<i2")
    with wave.open(os.path.join(GEN, name + ".wav"), "wb") as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(data.tobytes())


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def stft_shaped_noise(dur, center_fn, bw_oct_fn, rng, color=0.0):
    """Noise whose spectrum is a moving band-pass: center_fn(t)->Hz, bw_oct_fn(t)->octaves."""
    n = int(dur * SR); hop = 256; win = 1024
    noise = rng.standard_normal(n + win)
    out = np.zeros(n + win)
    w = np.hanning(win)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    lf = np.log2(np.maximum(freqs, 1.0))
    tilt = np.where(freqs > 0, (np.maximum(freqs, 20) / 1000.0) ** (-color / 2), 0)
    for start in range(0, n, hop):
        t = start / SR
        c = np.log2(max(center_fn(t), 20.0)); bw = max(bw_oct_fn(t), 0.05)
        mask = np.exp(-0.5 * ((lf - c) / (bw / 2.355 * 2)) ** 2) * tilt
        seg = noise[start:start + win] * w
        out[start:start + win] += np.fft.irfft(np.fft.rfft(seg) * mask, win) * w
    return out[:n]


def env_adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, a, endpoint=False), np.linspace(1, s, d, endpoint=False),
                        np.full(sus, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def reverb(x, seconds=1.8, mix=0.3, seed=7, stereo=False):
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    chans = []
    for c in range(2 if stereo else 1):
        ir = rng.standard_normal(n) * np.exp(-6.9 * t / seconds)
        ir[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
        ir /= np.sqrt(np.sum(ir ** 2))
        m = len(x) + n
        size = 1 << int(np.ceil(np.log2(m)))
        wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:m]
        dry = np.pad(x, (0, n))
        chans.append(dry * (1 - mix) + wet * mix * 3)
    return np.stack(chans, axis=1) if stereo else chans[0]


def bell(freq, dur, decay=1.2, bright=1.0):
    t = t_axis(dur)
    partials = [(1.0, 1.0), (2.0, 0.5 * bright), (2.76, 0.35 * bright), (5.4, 0.18 * bright), (8.93, 0.08 * bright)]
    x = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * (decay * (1 + r * 0.6))) for r, a in partials)
    att = int(0.003 * SR); x[:att] *= np.linspace(0, 1, att)
    return x


def pad(freqs, dur, attack=0.6, release=1.0, detune=0.004, rng=None):
    t = t_axis(dur); x = np.zeros_like(t)
    for f in freqs:
        for d in (-detune, 0, detune):
            ph = (rng.random() if rng is not None else 0) * 2 * np.pi
            x += np.sin(2 * np.pi * f * (1 + d) * t + ph) + 0.25 * np.sin(4 * np.pi * f * (1 + d) * t + ph)
    return x * env_adsr(len(t), attack, 0.3, 0.8, release)


def sine_tone(f, dur, a=0.005, r=0.05):
    t = t_axis(dur)
    return np.sin(2 * np.pi * f * t) * env_adsr(len(t), a, 0.01, 1.0, r)


def place(buf, x, at):
    i = int(at * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[: j - i]; return buf


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR); y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc; y[i] = acc
    return y


def lowpass_fft(x, cutoff, order=4):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) / np.sqrt(1 + (f / cutoff) ** (2 * order)), len(x))


def highpass_fft(x, cutoff, order=2):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = (f / cutoff) ** order / np.sqrt(1 + (f / cutoff) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x) * h, len(x))


def loop_crossfade(x, xfade):
    """x is longer than the target by xfade seconds; folds the tail over the head (equal power)."""
    k = int(xfade * SR); body = x[:-k].copy(); tail = x[-k:]
    g = np.linspace(0, np.pi / 2, k)
    body[:k] = body[:k] * np.sin(g) + tail * np.cos(g)
    return body


def riser(dur, seed, f0=300, f1=7000):
    rng = np.random.default_rng(seed)
    t = t_axis(dur)
    p = t / dur
    noise = stft_shaped_noise(dur, lambda s: f0 * (f1 / f0) ** ((s / dur) ** 1.6), lambda s: 1.6 - 0.8 * s / dur, rng)
    noise *= p ** 2.2
    chirp_f = 110 * (8 ** (p ** 1.5))
    phase = 2 * np.pi * np.cumsum(chirp_f) / SR
    tone = (np.sin(phase) + 0.3 * np.sin(2 * phase)) * p ** 2.5 * 0.35
    trem = 1 - 0.35 * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(2 + 14 * p ** 2) / SR)) * p
    x = (noise / (np.max(np.abs(noise)) or 1) + tone) * trem
    end = int(0.012 * SR); x[-end:] *= np.linspace(1, 0, end)
    return x


def whoosh(dur, seed, peak_at=0.55, f_lo=250, f_hi=3200, reverse=False):
    rng = np.random.default_rng(seed)
    pk = peak_at * dur

    def center(s):
        return f_lo * (f_hi / f_lo) ** (s / pk) if s < pk else f_hi * (f_lo / f_hi) ** ((s - pk) / (dur - pk))
    x = stft_shaped_noise(dur, center, lambda s: 1.2, rng, color=1.0)
    t = t_axis(dur)
    e = np.where(t < pk, (t / pk) ** 2.5, np.exp(-5 * (t - pk) / (dur - pk)))
    x = x * e
    if reverse:
        x = x[::-1].copy()
    return x


def main():
    rng = np.random.default_rng(2026)

    # --- transitions
    save("riser-short-2s", riser(2.0, 11))
    save("riser-medium-4s", riser(4.0, 12, f0=200, f1=8000))
    save("riser-long-8s", riser(8.0, 13, f0=150, f1=9000))
    sw = stft_shaped_noise(3.2, lambda s: 400 * (3000 / 400) ** (s / 3.2), lambda s: 2.5, np.random.default_rng(14), color=1.0)
    sw_t = t_axis(3.2); sw *= (sw_t / 3.2) ** 3
    swell = sw / np.max(np.abs(sw)) * 0.7 + pad([220, 277.18, 329.63, 440], 3.2, attack=2.8, release=0.05, rng=rng) * (sw_t / 3.2) ** 2 * 0.08
    swell[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    save("swell-soft-3s", swell)
    save("whoosh-medium-1s", whoosh(1.0, 15))
    save("whoosh-long-2s", whoosh(2.0, 16, peak_at=0.5, f_lo=180, f_hi=2600))
    rw = whoosh(1.1, 17, peak_at=0.2, f_lo=300, f_hi=4000, reverse=True)
    save("whoosh-reverse-1s", rw)
    shimmer = stft_shaped_noise(2.0, lambda s: 7000, lambda s: 2.0, np.random.default_rng(18))
    shimmer *= np.exp(-2.2 * t_axis(2.0)); shimmer = shimmer[::-1].copy()
    shimmer[-int(0.008 * SR):] *= np.linspace(1, 0, int(0.008 * SR))
    save("reverse-cymbal-2s", shimmer)
    dl = riser(2.0, 19, f0=250, f1=6000)[::-1].copy()
    save("downlifter-2s", dl)
    snd = whoosh(0.45, 22, peak_at=0.7, f_lo=600, f_hi=5000)
    snd[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    save("send-whoosh-up", snd)


    def glitch(seed, dur):
        r = np.random.default_rng(seed); n = int(dur * SR); x = np.zeros(n); t = np.arange(n) / SR
        r.random(n)  # unused draw, kept so the random stream (and the output) stays the same as the published files
        pos = 0
        while pos < n:
            seg = int(r.uniform(0.012, 0.045) * SR)
            f = r.choice([220, 330, 440, 660, 880, 1320])
            tt = np.arange(seg) / SR
            tone = np.sign(np.sin(2 * np.pi * f * tt)) * 0.4 + r.standard_normal(seg) * 0.25 * r.random()
            q = 2 ** r.integers(3, 6); tone = np.round(tone * q) / q
            if r.random() < 0.25:
                tone *= 0
            x[pos:pos + seg] = tone[: n - pos]
            pos += seg
        x = lowpass_fft(x, 6000, 2) * env_adsr(n, 0.004, 0.05, 0.8, dur * 0.4)
        return x

    save("glitch-soft-1", glitch(41, 0.32))
    save("glitch-soft-2", glitch(42, 0.5))

    # --- stingers (stereo, with reverb)
    cmaj9 = [261.63, 329.63, 392.0, 493.88, 587.33]
    x = pad(cmaj9, 3.2, attack=0.35, release=1.6, rng=rng) * 0.12
    for i, f in enumerate([1046.5, 1318.5, 1568.0]):
        place(x, bell(f, 2.2, decay=1.6, bright=0.6) * 0.25, 0.15 + i * 0.18)
    save("stinger-calm-pad", reverb(np.pad(x, (0, int(0.8 * SR))), 2.4, 0.35, stereo=True))

    t = t_axis(4.0)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-t * 6)) / SR) * np.exp(-t * 1.1)
    amin = [110.0, 130.81, 164.81, 220.0]
    strings = np.zeros_like(t)
    for f in amin:
        for d in (-0.003, 0, 0.003):
            strings += 2 * ((f * (1 + d) * t) % 1) - 1
    strings = lowpass_fft(strings, 900) * env_adsr(len(t), 0.25, 0.5, 0.7, 2.0) * 0.14
    save("stinger-serious-low", reverb(boom * 0.8 + strings, 2.6, 0.3, stereo=True))

    r = riser(1.2, 20, f0=400, f1=8000) * 0.5
    hit_t = t_axis(2.2)
    kick = np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-hit_t * 30)) / SR) * np.exp(-hit_t * 7)
    burst = rng.standard_normal(len(hit_t)) * np.exp(-hit_t * 18) * 0.35
    stab = np.zeros_like(hit_t)
    for f in [392.0, 493.88, 587.33, 783.99]:
        stab += np.sign(np.sin(2 * np.pi * f * hit_t)) * 0.15 + np.sin(2 * np.pi * f * hit_t) * 0.3
    stab = lowpass_fft(stab, 3500) * np.exp(-hit_t * 3.2) * 0.35
    total = np.zeros(int(3.4 * SR)); place(total, r, 0.0); place(total, kick + burst + stab, 1.2)
    save("stinger-energetic-hit", reverb(total, 1.6, 0.25, stereo=True))

    x = np.zeros(int(2.6 * SR))
    for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        place(x, bell(f, 2.0, decay=1.4) * (0.8 + 0.1 * i), i * 0.11)
    save("stinger-intro-bells", reverb(x, 1.8, 0.3, stereo=True))

    x = np.zeros(int(3.6 * SR))
    for i, f in enumerate([783.99, 659.25, 587.33, 523.25]):
        place(x, bell(f, 2.4, decay=1.0, bright=0.5) * 0.7, i * 0.32)
    place(x, pad([261.63, 329.63, 392.0], 2.6, attack=0.4, release=1.4, rng=rng) * 0.06, 0.9)
    save("stinger-outro-soft", reverb(x, 2.4, 0.35, stereo=True))

    # --- feedback
    x = np.zeros(int(1.4 * SR)); place(x, bell(1318.5, 1.2, decay=3.0), 0); place(x, bell(1975.5, 1.2, decay=3.0) * 0.9, 0.12)
    save("success-chime", reverb(x, 0.9, 0.2))
    x = np.zeros(int(0.45 * SR)); place(x, sine_tone(880, 0.07), 0); place(x, sine_tone(1318.5, 0.16, r=0.12), 0.075)
    save("check-mark", x)
    t = t_axis(0.5); sq = np.sign(np.sin(2 * np.pi * 140 * t)) * 0.5 + np.sin(2 * np.pi * 70 * t)
    gate = ((t % 0.25) < 0.17).astype(float); sq = lowpass_fft(sq * gate, 1200) * env_adsr(len(t), 0.005, 0.05, 0.8, 0.08)
    save("error-buzz-soft", sq)
    x = np.zeros(int(0.9 * SR)); place(x, sine_tone(880, 0.25, a=0.02, r=0.15) + 0.2 * sine_tone(1760, 0.25, a=0.02, r=0.15), 0)
    place(x, sine_tone(659.25, 0.4, a=0.02, r=0.3) + 0.2 * sine_tone(1318.5, 0.4, a=0.02, r=0.3), 0.28)
    save("alert-soft", x)
    x = np.zeros(int(4.0 * SR))
    for i in range(3):
        place(x, sine_tone(880, 0.12, r=0.04), i * 1.0)
    place(x, sine_tone(1760, 0.6, r=0.25), 3.0)
    save("countdown-beeps-3-2-1", x)
    save("beep-short", sine_tone(1000, 0.15, a=0.004, r=0.05))

    # --- office composites (CC0 sources)
    if SRC:
        office_composites()
    else:
        print("No --sources: skipping cash-register-cha-ching, stamp-thud, calculator-keys and ambience-office-busy-45s")
    ambience()


def office_composites():
    coins = load(source("handleCoins.ogg"))
    x = np.zeros(int(1.8 * SR)); place(x, coins * 0.8, 0.0)
    ring = bell(2349.3, 1.5, decay=2.2, bright=0.8) + bell(2793.8, 1.5, decay=2.4, bright=0.6) * 0.7
    place(x, ring * 0.35, 0.16)
    save("cash-register-cha-ching", x)
    thud = load(source("bookPlace1.ogg")); low = load(source("impactSoft_medium_000.ogg"))
    x = np.zeros(int(0.6 * SR)); place(x, thud, 0.0); place(x, low * 0.6, 0.0)
    save("stamp-thud", x)
    click = load(source("click3.ogg")); click2 = load(source("click2.ogg"))
    crng = np.random.default_rng(21); x = np.zeros(int(1.6 * SR)); at = 0.0
    for i in range(8):
        c = click if i % 2 else click2
        idx = np.arange(0, len(c) - 1, 1.25); c = np.interp(idx, np.arange(len(c)), c)
        place(x, c * (0.6 + 0.4 * crng.random()), at); at += 0.12 + 0.08 * crng.random()
    save("calculator-keys", x)

# --- ambience (mono, clean loops)
def roomtone(dur, seed, hum=True, hiss=0.15):
    r = np.random.default_rng(seed); n = int(dur * SR)
    brown = np.cumsum(r.standard_normal(n)); brown = highpass_fft(brown, 25, 2)
    body = lowpass_fft(brown, 500, 2); body /= np.max(np.abs(body))
    air = highpass_fft(r.standard_normal(n), 3000, 2); air /= np.max(np.abs(air))
    mod = 1 + 0.08 * np.sin(2 * np.pi * 0.07 * np.arange(n) / SR + r.random() * 6)
    x = body * mod + air * hiss
    if hum:
        tt = np.arange(n) / SR
        x += 0.02 * np.sin(2 * np.pi * 50 * tt) + 0.012 * np.sin(2 * np.pi * 100 * tt) + 0.006 * np.sin(2 * np.pi * 150 * tt)
    return x

def ambience():
    save("ambience-room-tone-30s", loop_crossfade(roomtone(33.0, 31, hum=False, hiss=0.015), 3.0))
    save("ambience-office-hvac-45s", loop_crossfade(roomtone(48.0, 32, hum=True, hiss=0.03), 3.0))

    if not SRC:
        return
    busy = roomtone(48.0, 33, hum=True, hiss=0.025)
    busy /= np.max(np.abs(busy))
    brng = np.random.default_rng(34)
    typing = [load(source(f"human_vel-00{i}.wav")) for i in (2, 3, 4, 6, 7)]
    mouse = load(source("mouseclick1.ogg"))
    paper = load(source("Paper Sound - 3.wav"))
    events = np.zeros_like(busy)
    at = 1.0
    while at < 44.0:
        src = typing[brng.integers(len(typing))]
        seg_len = int((2 + 4 * brng.random()) * SR); st = brng.integers(0, max(1, len(src) - seg_len))
        seg = src[st:st + seg_len] * np.hanning(seg_len) ** 0.2
        place(events, seg * (0.25 + 0.2 * brng.random()), at)
        at += seg_len / SR + 1.5 + 4 * brng.random()
    for _ in range(9):
        place(events, mouse * 0.25, 1 + 42 * brng.random())
    for _ in range(3):
        place(events, paper * 0.3, 2 + 40 * brng.random())
    events = lowpass_fft(events, 2500, 2)
    events = reverb(events, 0.8, 0.45, seed=35)[: len(busy)]
    mix = busy * 0.6 + events / (np.max(np.abs(events)) or 1) * 0.35
    save("ambience-office-busy-45s", loop_crossfade(mix, 3.0))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synthesizes the library's generated CC0 sounds (raw, before loudness processing).")
    parser.add_argument("--out", required=True, help="folder for the raw WAV files")
    parser.add_argument("--sources", help="folder with the unzipped CC0 downloads used by the 4 composites")
    a = parser.parse_args()
    GEN = os.path.abspath(a.out)
    SRC = os.path.abspath(a.sources) if a.sources else None
    os.makedirs(GEN, exist_ok=True)
    main()

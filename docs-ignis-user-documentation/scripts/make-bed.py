# Generates the IgnisLabs ambient bed (assets/ignis-ambient-bed.mp3): warm pad + soft bass + gentle
# plucks + light reverb, 84 BPM, Cmaj7 - Am7 - Fmaj7 - G6. Fully synthesized (no samples), so it carries
# no third-party licence. Only needed to retune the bed; videos use the saved mp3.
#   python3 make-bed.py <out.wav> [seconds=360]      then: ffmpeg -i out.wav -b:a 128k ignis-ambient-bed.mp3
# Needs numpy. Needs about 2 GB of memory for 6 minutes.
import numpy as np, wave, sys

SR = 44100
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

def hz(m):  # midi -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)

# 8-bar loop, two bars per chord: Cmaj7 - Am7 - Fmaj7 - G6
CHORDS = [
    ("C", 36, [60, 64, 67, 71]),
    ("A", 33, [57, 60, 64, 67]),
    ("F", 41, [57, 60, 64, 65 + 0]),  # F A C E -> 53,57,60,64 spread below
    ("G", 43, [59, 62, 64, 67]),
]
CHORDS[2] = ("F", 41, [57, 60, 64, 69])

LOOP_BARS = 8
LOOP = LOOP_BARS * BAR
SECONDS = float(sys.argv[2]) if len(sys.argv) > 2 else 360.0
LOOPS = int(np.ceil(SECONDS / LOOP))
N = int(LOOPS * LOOP * SR) + SR * 4
L = np.zeros(N); R = np.zeros(N)

def env_ar(n, a, r):
    t = np.arange(n) / SR
    e = np.minimum(t / a, 1.0) * np.minimum((n / SR - t) / r, 1.0)
    return np.clip(e, 0, 1) ** 1.5

def add(buf, start, sig, gain=1.0):
    s = int(start * SR)
    e = min(s + len(sig), len(buf))
    buf[s:e] += gain * sig[: e - s]

def pad_voice(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for det in (-0.004, 0.0, 0.004):  # slight detune for width
        ff = f * (1 + det)
        # soft saw-ish: first harmonics with 1/k rolloff
        for k, a in ((1, 1.0), (2, 0.35), (3, 0.15), (4, 0.06)):
            out += a * np.sin(2 * np.pi * ff * k * t + rng.uniform(0, 6.28))
    return out * env_ar(n, 1.6, 2.2)

def pluck(f, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
    return s * np.exp(-t * 3.2) * np.minimum(t / 0.004, 1)

ARP = [0, 1, 2, 3, 2, 1, 2, 3]  # eighth notes over a bar

for li in range(LOOPS):
    for ci, (_, root, notes) in enumerate(CHORDS):
        t0 = li * LOOP + ci * 2 * BAR
        dur = 2 * BAR + 1.8
        # pad: voices spread L/R
        for vi, m in enumerate(notes):
            v = pad_voice(hz(m - 12), dur)
            pan = [0.35, 0.65, 0.45, 0.6][vi]
            add(L, t0, v, 0.055 * (1 - pan) * 2)
            add(R, t0, v, 0.055 * pan * 2)
        # bass: root, long
        b = pad_voice(hz(root), dur)
        add(L, t0, b, 0.09); add(R, t0, b, 0.09)
        # plucks: two bars of eighth-note arpeggio, alternating pan, softer on offbeats
        for bar in range(2):
            for i, idx in enumerate(ARP):
                tt = t0 + bar * BAR + i * BEAT / 2
                m = notes[idx] + 12
                p = pluck(hz(m))
                vel = 0.045 if i % 2 == 0 else 0.028
                pan = 0.3 if i % 2 == 0 else 0.7
                add(L, tt, p, vel * (1 - pan) * 2); add(R, tt, p, vel * pan * 2)

# light reverb: decaying noise impulse response (1.8 s), per channel
def reverb(x, wet=0.28, rt=1.8):
    n = int(rt * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / rt))
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    ir /= np.sqrt(np.sum(ir ** 2))
    nfft = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return (1 - wet) * x + wet * y

L = reverb(L); R = reverb(R)
# gentle low-pass to keep it warm (about 5 kHz)
def lp_fft(x, fc=5000):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * 1 / np.sqrt(1 + (f / fc) ** 4), len(x))
L = lp_fft(L); R = lp_fft(R)

peak = max(np.abs(L).max(), np.abs(R).max())
L = L / peak * 0.8; R = R / peak * 0.8
st = np.stack([L, R], 1)
pcm = (st * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("seconds", N / SR)

#!/usr/bin/env python3
"""assets/src/*.png -> assets/<name>-lg.jpg (full) + assets/<name>-sm.jpg (768w landscape / 640w portrait).
hero.mp4 -> assets/hero.mp4 (re-encoded, faststart, no audio)."""
import subprocess, sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "assets" / "src", ROOT / "assets"
def save(im, path, w):
    im = im.copy()
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    return path.stat().st_size // 1024
for png in sorted(SRC.glob("*.png")):
    im = Image.open(png).convert("RGB")
    name = png.stem
    portrait = im.height > im.width
    lg = save(im, OUT / f"{name}-lg.jpg", 1024 if portrait else 1536)
    sm = save(im, OUT / f"{name}-sm.jpg", 640 if portrait else 768)
    print(f"{name:14s} {im.width}x{im.height}  lg {lg}KB  sm {sm}KB")
mp4 = SRC / "hero.mp4"
if mp4.exists():
    out = OUT / "hero.mp4"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp4), "-an", "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    print(f"hero.mp4 -> {out.stat().st_size // 1024}KB")

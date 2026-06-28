"""Generate the legacy PNG launcher icons (brand background + white pencil) for
all mipmap densities. The adaptive icon (mipmap-anydpi-v26) is defined in XML and
uses @color/ic_launcher_background + @drawable/ic_pencil_foreground; these PNGs
are the fallback for pre-API-26 launchers. Run: `python scripts/gen-icons.py`
(requires Pillow)."""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.normpath(os.path.join(HERE, "..", "android", "app", "src", "main", "res"))
BRAND = (12, 166, 120, 255)   # #0CA678 — Roughboard teal (distinct from Excalidraw)
WHITE = (255, 255, 255, 255)

SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
SS = 4  # supersample for crisp edges


def draw_pencil(S):
    """White pencil (tip at bottom), rotated to the diagonal edit-pencil look."""
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = S * 0.5
    half_w = S * 0.105
    top = S * 0.20
    ferrule_y = S * 0.30
    body_bottom = S * 0.66
    tip_y = S * 0.80
    d.rounded_rectangle([cx - half_w, top, cx + half_w, body_bottom],
                        radius=half_w * 0.5, fill=WHITE)
    d.polygon([(cx - half_w, body_bottom), (cx + half_w, body_bottom), (cx, tip_y)],
              fill=WHITE)
    d.rectangle([cx - half_w, ferrule_y, cx + half_w, ferrule_y + S * 0.018],
                fill=(0, 0, 0, 0))
    d.polygon([(cx - half_w * 0.34, tip_y - S * 0.055),
               (cx + half_w * 0.34, tip_y - S * 0.055), (cx, tip_y)],
              fill=(0, 0, 0, 0))
    return img.rotate(-45, resample=Image.BICUBIC, center=(cx, cx))


def make_icon(size, round_shape):
    S = size * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if round_shape:
        d.ellipse([0, 0, S - 1, S - 1], fill=BRAND)
    else:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.18, fill=BRAND)
    img = Image.alpha_composite(img, draw_pencil(S))
    return img.resize((size, size), Image.LANCZOS)


def make_playstore_icon():
    """512x512 icon for the Play Store listing."""
    return make_icon(512, False)


if __name__ == "__main__":
    for density, size in SIZES.items():
        folder = os.path.join(RES, f"mipmap-{density}")
        os.makedirs(folder, exist_ok=True)
        make_icon(size, False).save(os.path.join(folder, "ic_launcher.png"))
        make_icon(size, True).save(os.path.join(folder, "ic_launcher_round.png"))
        fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        fg = Image.alpha_composite(fg, draw_pencil(size * SS).resize((size, size), Image.LANCZOS))
        fg.save(os.path.join(folder, "ic_launcher_foreground.png"))
        print(f"  mipmap-{density}: {size}px")
    docs = os.path.normpath(os.path.join(HERE, "..", "docs"))
    os.makedirs(docs, exist_ok=True)
    make_playstore_icon().save(os.path.join(docs, "playstore-icon-512.png"))
    print("  docs/playstore-icon-512.png (Play listing)")
    print("Done.")

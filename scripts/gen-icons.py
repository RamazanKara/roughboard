"""Generate Roughboard's raster art from one teal-pencil design:
- legacy launcher icons (mipmap-*/ic_launcher*.png) for pre-API-26 launchers
- splash icons (drawable-*/splash_icon.png) for the launch screen
- docs/playstore-icon-512.png (Play listing icon)
- docs/feature-graphic-1024x500.png (Play feature graphic)

The adaptive launcher icon (mipmap-anydpi-v26) and the splash background are
defined in XML and reference @color/...; this script only makes the rasters.
Run: `python scripts/gen-icons.py` (requires Pillow).
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.normpath(os.path.join(HERE, "..", "android", "app", "src", "main", "res"))
DOCS = os.path.normpath(os.path.join(HERE, "..", "docs"))
BRAND = (12, 166, 120, 255)   # #0CA678 — Roughboard teal
WHITE = (255, 255, 255, 255)

ICON_SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
# ~144dp pencil on the splash
SPLASH_SIZES = {"mdpi": 144, "hdpi": 216, "xhdpi": 288, "xxhdpi": 432, "xxxhdpi": 576}
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


def make_splash_icon(size):
    return draw_pencil(size * SS).resize((size, size), Image.LANCZOS)


def _font(size):
    for path in (r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()


def make_feature_graphic():
    """1024x500 Play Store feature graphic: teal bg, app icon + wordmark."""
    W, H = 1024, 500
    img = Image.new("RGBA", (W, H), BRAND)
    icon = make_icon(300, False)
    img.alpha_composite(icon, (96, (H - 300) // 2))
    d = ImageDraw.Draw(img)
    d.text((430, 196), "Roughboard", font=_font(86), fill=WHITE)
    d.text((434, 296), "Offline hand-drawn whiteboard",
           font=_font(34), fill=(230, 252, 245, 255))
    return img.convert("RGB")


if __name__ == "__main__":
    for density, size in ICON_SIZES.items():
        folder = os.path.join(RES, f"mipmap-{density}")
        os.makedirs(folder, exist_ok=True)
        make_icon(size, False).save(os.path.join(folder, "ic_launcher.png"))
        make_icon(size, True).save(os.path.join(folder, "ic_launcher_round.png"))
        fg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        fg.alpha_composite(make_splash_icon(size))
        fg.save(os.path.join(folder, "ic_launcher_foreground.png"))
        print(f"  mipmap-{density}: launcher {size}px")

    for density, size in SPLASH_SIZES.items():
        folder = os.path.join(RES, f"drawable-{density}")
        os.makedirs(folder, exist_ok=True)
        make_splash_icon(size).save(os.path.join(folder, "splash_icon.png"))
        print(f"  drawable-{density}: splash_icon {size}px")

    os.makedirs(DOCS, exist_ok=True)
    make_icon(512, False).save(os.path.join(DOCS, "playstore-icon-512.png"))
    make_feature_graphic().save(os.path.join(DOCS, "feature-graphic-1024x500.png"))
    print("  docs/playstore-icon-512.png + docs/feature-graphic-1024x500.png")
    print("Done.")

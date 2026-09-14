"""Generate the AI115 favicon family and the deterministic social preview image.

The generated illustration is kept as assets/og-art.png. Text is rendered here
with a local Traditional-Chinese font so the final OG image never depends on
the image model's text rendering or a social crawler's font fallback.
"""

from pathlib import Path
import os

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PAPER = "#fbfaf5"
INK = "#142c33"
SEA = "#176b73"
SEA_BRIGHT = "#27939a"
CORAL = "#f16b4f"
SUN = "#f4b942"

SANS_FONT = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "NotoSansTC-VF.ttf"
SERIF_FONT = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "NotoSerifTC-VF.ttf"


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.truetype("DejaVuSans.ttf", size)


def draw_squid_icon(size: int, maskable: bool = False) -> Image.Image:
    """Draw a small, legible squid mark at 4x and downsample it."""

    scale = 4
    canvas_size = size * scale
    image = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    def n(value: float) -> int:
        return round(value * scale)

    if maskable:
        draw.rectangle((0, 0, canvas_size, canvas_size), fill=INK)
        inset = size * 0.08
        draw.rounded_rectangle(
            (n(inset), n(inset), n(size - inset), n(size - inset)),
            radius=n(size * 0.14),
            fill=SEA,
            outline=(251, 250, 245, 180),
            width=max(2, n(size * 0.012)),
        )
    else:
        draw.rounded_rectangle(
            (n(2), n(2), n(size - 2), n(size - 2)),
            radius=n(size * 0.21),
            fill=PAPER,
            outline=SEA,
            width=max(2, n(size * 0.018)),
        )

    # Orbit and data dots reinforce the AI / ocean-lab theme.
    orbit_box = (n(size * 0.16), n(size * 0.14), n(size * 0.84), n(size * 0.84))
    draw.arc(orbit_box, 205, 330, fill=SUN, width=max(2, n(size * 0.018)))
    for x, y, color in ((0.2, 0.34, SUN), (0.78, 0.24, CORAL), (0.75, 0.72, PAPER)):
        radius = max(2, n(size * 0.027))
        draw.ellipse((n(size * x) - radius, n(size * y) - radius, n(size * x) + radius, n(size * y) + radius), fill=color)

    # Coral head and small top fin.
    draw.polygon(
        [(n(size * 0.48), n(size * 0.22)), (n(size * 0.64), n(size * 0.09)), (n(size * 0.64), n(size * 0.32))],
        fill=SUN,
        outline=INK,
    )
    draw.ellipse(
        (n(size * 0.28), n(size * 0.25), n(size * 0.74), n(size * 0.59)),
        fill=CORAL,
        outline=INK,
        width=max(2, n(size * 0.02)),
    )

    # Eyes.
    eye_radius = max(3, n(size * 0.04))
    for x in (0.43, 0.59):
        draw.ellipse((n(size * x) - eye_radius, n(size * 0.37) - eye_radius, n(size * x) + eye_radius, n(size * 0.37) + eye_radius), fill=INK)
        glint = max(1, n(size * 0.012))
        draw.ellipse((n(size * x) - glint, n(size * 0.35) - glint, n(size * x) + glint, n(size * 0.35) + glint), fill=PAPER)

    # Eight tentacles, simplified for small icon sizes.
    line_width = max(3, n(size * 0.032))
    tentacles = [
        [(0.34, 0.55), (0.25, 0.68), (0.30, 0.78), (0.24, 0.84)],
        [(0.41, 0.57), (0.38, 0.71), (0.44, 0.79), (0.40, 0.88)],
        [(0.49, 0.58), (0.48, 0.73), (0.53, 0.80), (0.51, 0.89)],
        [(0.57, 0.57), (0.62, 0.71), (0.58, 0.80), (0.64, 0.87)],
        [(0.65, 0.54), (0.74, 0.65), (0.70, 0.76), (0.77, 0.82)],
    ]
    for points in tentacles:
        draw.line([(n(x * size), n(y * size)) for x, y in points], fill=INK, width=line_width, joint="curve")

    return image.resize((size, size), Image.Resampling.LANCZOS)


def create_icons() -> None:
    for size, filename in ((16, "favicon-16.png"), (32, "favicon-32.png"), (180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")):
        draw_squid_icon(size).save(ASSETS / filename, format="PNG", optimize=True)

    for size, filename in ((192, "icon-maskable-192.png"), (512, "icon-maskable-512.png")):
        draw_squid_icon(size, maskable=True).save(ASSETS / filename, format="PNG", optimize=True)

    icon_images = [draw_squid_icon(size).convert("RGB") for size in (16, 32, 48)]
    icon_images[0].save(ASSETS / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icon_images[1:])


def create_og_preview() -> None:
    source = Image.open(ASSETS / "og-art.png").convert("RGB")
    image = ImageOps.fit(source, (1200, 630), method=Image.Resampling.LANCZOS, centering=(0.52, 0.5))
    draw = ImageDraw.Draw(image, "RGBA")

    # A quiet cream panel gives the exact Chinese title a stable contrast zone.
    panel = [(0, 0), (660, 0), (638, 88), (660, 166), (610, 244), (615, 330), (566, 410), (520, 490), (430, 560), (350, 630), (0, 630)]
    draw.polygon(panel, fill=(251, 250, 245, 244))
    draw.rectangle((72, 104, 78, 526), fill=CORAL)

    label_font = font(SANS_FONT, 22)
    title_font = font(SERIF_FONT, 70)
    sub_font = font(SANS_FONT, 28)
    footer_font = font(SANS_FONT, 20)
    mono_font = font(SANS_FONT, 19)

    draw.text((108, 86), "AI115．行前實驗室", fill=SEA, font=label_font)
    draw.text((108, 155), "AI115", fill=CORAL, font=title_font)
    draw.text((108, 241), "海洋實驗室", fill=INK, font=title_font)
    draw.text((112, 340), "石門國小備戰站", fill=INK, font=sub_font)
    draw.line((112, 404, 426, 404), fill=SUN, width=7)
    draw.text((112, 432), "給六年級選手的實戰教材", fill=SEA, font=footer_font)
    draw.text((112, 568), "桃園市 115 年度總統盃 AI 素養爭霸賽", fill=INK, font=mono_font)

    image.save(ASSETS / "og-preview.png", format="PNG", optimize=True)


if __name__ == "__main__":
    ASSETS.mkdir(parents=True, exist_ok=True)
    create_icons()
    create_og_preview()
    print("generated favicon family and 1200x630 og-preview.png")

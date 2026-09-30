"""Draw the home-screen icons. Run once and commit the PNGs."""

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "public"


def draw(size: int, padding: float) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    inset = int(size * padding)
    radius = int(size * 0.22)
    draw.rounded_rectangle((inset, inset, size - inset - 1, size - inset - 1), radius=radius, fill=(126, 203, 255, 255))
    cx = size / 2
    cy = size / 2
    body = size * 0.22
    draw.ellipse((cx - body, cy - body * 0.15, cx + body, cy + body * 0.95), fill=(110, 216, 74, 255))
    head = size * 0.2
    draw.ellipse((cx - head, cy - head * 1.35, cx + head, cy + head * 0.15), fill=(110, 216, 74, 255))
    spike = [
        (cx, cy - head * 1.7),
        (cx - head * 0.28, cy - head * 1.15),
        (cx + head * 0.28, cy - head * 1.15),
    ]
    draw.polygon(spike, fill=(255, 150, 40, 255))
    eye = size * 0.045
    for side in (-1, 1):
        ex = cx + side * head * 0.38
        ey = cy - head * 0.55
        draw.ellipse((ex - eye, ey - eye, ex + eye, ey + eye), fill=(255, 255, 255, 255))
        pupil = eye * 0.48
        draw.ellipse((ex - pupil, ey - pupil * 0.2, ex + pupil, ey + pupil * 1.3), fill=(36, 48, 68, 255))
    draw.arc(
        (cx - head * 0.35, cy - head * 0.35, cx + head * 0.35, cy + head * 0.05),
        start=20,
        end=160,
        fill=(36, 48, 68, 255),
        width=max(2, size // 48),
    )
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    icons = {
        "favicon-32.png": (32, 0.08),
        "apple-touch-icon.png": (180, 0.0),
        "pwa-192.png": (192, 0.0),
        "pwa-512.png": (512, 0.0),
        "maskable-512.png": (512, 0.12),
    }
    for name, (size, padding) in icons.items():
        draw(size, padding).save(OUT / name)
        print(name)


if __name__ == "__main__":
    main()

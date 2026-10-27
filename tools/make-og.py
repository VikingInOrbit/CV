from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


root = Path(__file__).resolve().parents[1]
out = root / "docs" / "assets" / "og.png"
font_path = "C:/Windows/Fonts/consola.ttf"
small_path = "C:/Windows/Fonts/consolab.ttf"
image = Image.new("RGB", (1200, 630), "#0b1512")
draw = ImageDraw.Draw(image)
for x in range(0, 1200, 40):
    draw.line((x, 0, x, 630), fill="#16352f", width=1)
for y in range(0, 630, 40):
    draw.line((0, y, 1200, y), fill="#16352f", width=1)
draw.rectangle((50, 50, 1150, 580), outline="#f2b01e", width=5)
draw.text((100, 160), "GABRIEL RØER", fill="#f2b01e", font=ImageFont.truetype(font_path, 72))
draw.text((105, 285), "APPLIED ROBOTICS, NMBU", fill="#f1efe0", font=ImageFont.truetype(small_path, 38))
draw.text((105, 365), "CEO, ECLIPSE NMBU", fill="#2fd6c8", font=ImageFont.truetype(small_path, 38))
image.save(out)
print(f"Wrote {out}")

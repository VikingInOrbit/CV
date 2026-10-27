from pathlib import Path

import qrcode


ROOT = Path(__file__).resolve().parents[1]
output = ROOT / "docs" / "assets" / "site-qr.png"
output.parent.mkdir(parents=True, exist_ok=True)

qrcode.make("https://vikinginorbit.github.io/CV/").save(output)
print(f"Wrote {output}")

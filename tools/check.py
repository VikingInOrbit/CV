import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
errors = []
external = set()


class AuditParser(HTMLParser):
    void = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
    def __init__(self):
        super().__init__()
        self.stack, self.ids, self.h1, self.images = [], set(), 0, []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            if attrs["id"] in self.ids: errors.append(f"duplicate id {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag == "h1": self.h1 += 1
        if tag == "img": self.images.append(attrs)
        for key in ("href", "src", "srcset"):
            value = attrs.get(key, "")
            for item in value.split(",") if key == "srcset" else [value]:
                item = item.strip().split()[0] if item.strip() else ""
                if not item: continue
                parsed = urlparse(item)
                if parsed.scheme or item.startswith("//"):
                    external.add(item)
                elif item.startswith("/"):
                    errors.append(f"leading slash URL {item}")
                else:
                    target = (DOCS / item.split("#")[0].split("?")[0]).resolve()
                    if not target.exists(): errors.append(f"missing relative target {item}")
        if tag not in self.void: self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in self.stack:
            while self.stack:
                current = self.stack.pop()
                if current == tag: break
        else: errors.append(f"unmatched closing tag {tag}")


def check(name, condition):
    print(("PASS " if condition else "FAIL ") + name)
    if not condition: errors.append(name)


for html_file in DOCS.glob("*.html"):
    parser = AuditParser()
    text = html_file.read_text(encoding="utf-8")
    parser.feed(text)
    check(f"{html_file.name} has balanced tags", not parser.stack)
    check(f"{html_file.name} has one h1", parser.h1 == 1)
    check(f"{html_file.name} has lang", bool(re.search(r"<html[^>]+lang=", text)))
    check(f"{html_file.name} has viewport", "name=\"viewport\"" in text)
    check(f"{html_file.name} images have alt", all("alt" in image for image in parser.images))
    check(f"{html_file.name} ids are unique", len(parser.ids) == len(set(parser.ids)))

for path in DOCS.rglob("*"):
    if path.is_file() and path.suffix.lower() not in {".pdf", ".png"}:
        text = path.read_text(encoding="utf-8")
        banned = [r"<<", r"\bFILL\b(?!\s*=)", "\u2014", r"dyslex", r"\b6\.4\b", r"HEMMELIG", r"\bRust\b", r"\bAddexio\b", r"clearance"]
        check(f"{path.relative_to(ROOT)} has no banned strings", not any(re.search(item, text, re.IGNORECASE) for item in banned))

vcf = (DOCS / "contact.vcf").read_bytes()
check("contact.vcf is UTF-8 CRLF", b"\r\n" in vcf and b"\n" not in vcf.replace(b"\r\n", b"") and vcf.decode("utf-8"))
check("contact.vcf has required fields", all(field in vcf.decode("utf-8") for field in ["VERSION:3.0", "N:Røer;Gabriel;;;", "FN:Gabriel Røer", "END:VCARD"]))
check("contact.vcf has birthday", b"BDAY:20021202" in vcf)
non_pdf = sum(p.stat().st_size for p in DOCS.rglob("*") if p.is_file() and p.name not in {"Gabriel-Roer-CV.pdf", "og.png"})
check("docs size budget under 120 KB", non_pdf < 120000)
index = (DOCS / "index.html").read_text(encoding="utf-8")
external_anchor_tags = re.findall(r"<a\b[^>]*href=\"https?://[^>]+>", index)
check("external links use noopener", all("target=\"_blank\"" not in tag or "noopener" in tag for tag in external_anchor_tags))
check("no unset href", "href=\"mailto:\"" not in index and "href=\"<<\"" not in index)
print("External URLs:")
for item in sorted(external): print(item)
if errors:
    for error in errors: print(f"DETAIL {error}")
    print(f"SUMMARY FAIL ({len(errors)} issue(s))")
    sys.exit(1)
print("SUMMARY PASS")

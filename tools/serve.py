import argparse
import http.server
import mimetypes
import socket
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1] / "docs"


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map[".vcf"] = "text/vcard; charset=utf-8"

    def do_GET(self):
        parsed = urlsplit(self.path)
        route = unquote(parsed.path)
        if route == "/":
            self.send_response(301)
            self.send_header("Location", "/CV/")
            self.end_headers()
            return
        if route.startswith("/CV/"):
            relative = route[4:].lstrip("/") or "index.html"
            candidate = (ROOT / relative).resolve()
            if candidate.is_relative_to(ROOT.resolve()) and candidate.is_file():
                body = candidate.read_bytes()
                content_type = self.extensions_map.get(candidate.suffix, mimetypes.guess_type(candidate.name)[0] or "application/octet-stream")
                if candidate.suffix != ".vcf" and "charset" not in content_type:
                    content_type += "; charset=utf-8" if candidate.suffix in {".html", ".css", ".js", ".txt"} else ""
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
        self.send_error(404)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.path = "/CV/404.html"
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            body = (ROOT / "404.html").read_bytes()
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--lan", action="store_true")
    args = parser.parse_args()
    host = "0.0.0.0" if args.lan else "127.0.0.1"
    with http.server.ThreadingHTTPServer((host, 8080), Handler) as server:
        display_host = socket.gethostbyname(socket.gethostname()) if args.lan else "127.0.0.1"
        print(f"Serving {ROOT}")
        print(f"Open http://{display_host}:8080/CV/")
        server.serve_forever()


if __name__ == "__main__":
    main()

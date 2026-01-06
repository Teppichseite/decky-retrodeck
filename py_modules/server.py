import threading
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote
from models import Paths

class ServerHandler(SimpleHTTPRequestHandler):
    def _get_path_mappings(self):
        paths = self.server.config["paths"]
        return {
            "/es-de-media/": paths.esDeDownloadedMediaFolder,
        }

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")

    def end_headers(self):
        self._set_cors_headers()
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        path_mappings = self._get_path_mappings()
        for url_prefix, directory_path in path_mappings.items():
            if self.path.startswith(url_prefix):
                self._serving_directory = os.path.abspath(directory_path)
                self.path = self.path[len(url_prefix):]
                return super().do_GET()

        self.send_response(404)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Not Found")

    def do_POST(self):
        if self.path == "/api/game-event":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")

            self.server.config["on_game_event_callback"](body)

            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Not Found")

    def translate_path(self, path):
        if hasattr(self, '_serving_directory'):
            target_directory = self._serving_directory
            delattr(self, '_serving_directory')
            decoded_path = unquote(path)
            clean_path = decoded_path.lstrip('/')
            return os.path.join(target_directory, clean_path)
        
        return super().translate_path(path)


class Server:
    def server_target(self):
        server = HTTPServer(("localhost", self.port), ServerHandler)

        server.config = {
            "paths": self.paths,
            "on_game_event_callback": self.on_game_event_callback
        }

        server.serve_forever()

    def start_server(self):
        server_thread = threading.Thread(target=self.server_target, daemon=True)
        server_thread.start()

    def __init__(self, port: int, paths: Paths, on_game_event_callback: callable):
        self.port = port
        self.paths = paths
        self.on_game_event_callback = on_game_event_callback
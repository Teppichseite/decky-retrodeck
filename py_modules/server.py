import threading
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from models import Paths

class ServerHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/es-de-media/"):
            self.path = self.path[len("/es-de-media/"):]
            return super().do_GET()

        self.send_error(404, "Not Found")

    def do_POST(self):
        if self.path == "/api/game-event":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")

            self.server.config["on_game_event_callback"](body)

            self.send_response(200)
        else:
            self.send_error(404, "Not Found")

    def translate_path(self, path):
        path = super().translate_path(path)
        cwd = os.getcwd()
        return path.replace(cwd, os.path.abspath(self.server.config["paths"].esDeDownloadedMediaFolder), 1)


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
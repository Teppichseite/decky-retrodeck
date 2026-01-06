import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote

from es_de_helper import EsDeHelper
from key_emitter import KeyEmitter
from models import GameEvent, Paths
from server import Server

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repoc
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import asyncio
from dataclasses import dataclass, asdict
import json


class Plugin:
    actions: list[dict] = None

    key_emitter = KeyEmitter()

    paths: Paths = None

    server: Server = None

    es_de_helper: EsDeHelper = None

    game_event: GameEvent = None

    states: dict[str, str] = dict()

    async def _main(self):
        self.loop = asyncio.get_event_loop()
        paths_path = os.path.join(os.path.dirname(__file__), "presets", "retrodeck", "paths.json")
        with open(paths_path, "r") as f:
            paths_data = json.load(f)
        
        paths_data["pluginFolder"] = decky.DECKY_PLUGIN_DIR
        self.paths = Paths(**paths_data)

        decky.logger.info(f"Initialized plugin with paths: {self.paths}")

        self.server = Server(8089, self.paths, self.on_game_event)
        self.server.start_server()

        self.es_de_helper = EsDeHelper(self.paths)
        self.es_de_helper.initialize();

        self.load_actions()

        decky.logger.info("Hello World!")

    async def _unload(self):
        decky.logger.info("Goodnight World!")
        pass

    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
        pass

    async def _migration(self):
        decky.logger.info("Migrating")

    async def get_game_event(self) -> dict:
        return asdict(self.game_event)

    def on_game_event(self, game_event_raw: str):
        game_event = self.build_game_event(game_event_raw)
        decky.logger.info(f"Game event: {game_event}")
        self.game_event = game_event
        self.loop.call_soon_threadsafe(
            asyncio.create_task, 
            decky.emit("game_event", json.dumps(asdict(game_event)))
        )

    def build_game_event(self, raw_data: str) -> GameEvent:
        parts = raw_data.strip().split(";")
        if len(parts) != 5:
            decky.logger.error(f"Invalid game event data: {raw_data}")
            return None

        rom_path = parts[1]
        system_name = parts[3]
        image_path = self.es_de_helper.resolve_media_path(rom_path, system_name, "miximages")
        manual_path = self.es_de_helper.resolve_media_path(rom_path, system_name, "manuals")

        decky.logger.info(f"Image path: {image_path}")

        emulator_name = self.es_de_helper.resolve_emulator_name(system_name)

        decky.logger.info(f"Emulator name: {emulator_name}")

        return GameEvent(
            type=parts[0],
            path=rom_path,
            name=parts[2],
            system_name=system_name,
            system_full_name=parts[4],
            emulator_name=emulator_name or parts[4],
            image_path=image_path,
            manual_path=manual_path,
        )

    async def run_hotkey_action(self, type: str, keys: list[str]):
        if type == 'press':
            await self.key_emitter.press(keys)
        elif type == 'hold':
            await self.key_emitter.hold(keys)
        elif type == 'release':
            await self.key_emitter.release(keys)

    def load_actions(self):
        actions_path = os.path.join(os.path.dirname(__file__), "presets", "retrodeck", "actions.json")
        with open(actions_path, "r") as f:
            self.actions = json.load(f)

    async def get_actions(self) -> list[dict]:
        return self.actions

    async def get_state(self, key: str) -> str:
        return self.states.get(key, None)

    async def set_state(self, key: str, value: str):
        self.states[key] = value
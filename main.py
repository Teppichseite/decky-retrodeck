import os

from es_de_helper import EsDeHelper
from models import GameEvent, Paths
from server import Server

import asyncio
from dataclasses import asdict
import json

import decky

class Plugin:
    actions: list[dict] = None

    paths: Paths = None

    server: Server = None

    es_de_helper: EsDeHelper = None

    game_event: GameEvent = None

    states: dict[str, str] = dict()

    def _build_game_event(self, raw_data: str) -> GameEvent:
        parts = raw_data.strip().split(";")
        if len(parts) != 5:
            decky.logger.error(f"Invalid game event data: {raw_data}")
            return None

        rom_path = parts[1]
        system_name = parts[3]
        image_path = self.es_de_helper.resolve_media_path(self.server.get_es_de_media_url(), rom_path, system_name, "miximages")
        manual_path = self.es_de_helper.resolve_media_path(self.server.get_es_de_media_url(), rom_path, system_name, "manuals")

        emulator_name = self.es_de_helper.resolve_emulator_name(system_name)

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

    def _on_game_event(self, game_event_raw: str):

        decky.logger.info(f"Raw game event received: {game_event_raw}")

        game_event = self._build_game_event(game_event_raw)
        self.game_event = game_event
        self.loop.call_soon_threadsafe(
            asyncio.create_task, 
            decky.emit("game_event", json.dumps(asdict(game_event)))
        )
        decky.logger.info(f"Emitted game event: {game_event}")


    def _load_actions(self):
        actions_path = os.path.join(os.path.dirname(__file__), "presets", "retrodeck", "actions.json")
        with open(actions_path, "r") as f:
            self.actions = json.load(f)

        decky.logger.info(f"Loaded {len(self.actions)} actions")

    async def get_actions(self) -> list[dict]:
        return self.actions
    
    async def get_game_event(self) -> dict | None:
        if not self.game_event:
            return None
        return asdict(self.game_event)

    async def get_state(self, key: str) -> str:
        return self.states.get(key, None)

    async def set_state(self, key: str, value: str):
        self.states[key] = value

    async def _main(self):
        self.loop = asyncio.get_event_loop()
        paths_path = os.path.join(os.path.dirname(__file__), "presets", "retrodeck", "paths.json")
        with open(paths_path, "r") as f:
            paths_data = json.load(f)
        
        paths_data["pluginFolder"] = decky.DECKY_PLUGIN_DIR
        self.paths = Paths(**paths_data)

        decky.logger.info(f"Initialized plugin with paths: {self.paths}")

        self.server = Server(decky.logger, self.paths, self._on_game_event)
        self.server.start_server()

        self.es_de_helper = EsDeHelper(decky.logger, self.paths)
        self.es_de_helper.load_es_systems()
        self.es_de_helper.create_es_de_event_scripts(self.server.get_api_url())

        self._load_actions()

        decky.logger.info("Loaded RetroDeck plugin")

    async def _unload(self):
        decky.logger.info("Unloaded RetroDeck plugin")
        pass

    async def _uninstall(self):
        decky.logger.info("Uninstalled RetroDeck plugin")
        pass

    async def _migration(self):
        decky.logger.info("Migrating RetroDeck plugin")
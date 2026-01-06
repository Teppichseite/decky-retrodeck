from dataclasses import dataclass

@dataclass
class GameEvent:
    type: str
    path: str
    name: str
    system_name: str
    system_full_name: str
    emulator_name: list[str]
    image_path: str
    manual_path: str

@dataclass
class Paths:
    esDeConfigFolder: str
    esDeDownloadedMediaFolder: str
    esDeDefaultEsSystemsFile: str
    pluginFolder: str
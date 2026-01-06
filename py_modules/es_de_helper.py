import os
import xmltodict
from models import Paths

class EsDeHelper:

    es_systems: dict = None

    def __init__(self, paths: Paths):
        self.paths = paths

    def initialize(self):
        self.load_es_systems()
        self.write_es_de_event_scripts()

    def load_es_systems(self):
        es_systems = []
        es_systems_path = os.path.join(self.paths.pluginFolder, "presets", "retrodeck", "es_systems.xml")
        with open(es_systems_path, "r") as f: 
            xml_content = f.read()
            xml_content = self.preprocess_xml_for_comments(xml_content)
            es_systems = xmltodict.parse(xml_content)

        custom_es_systems = []
        custom_es_systems_path = os.path.join(self.paths.esDeConfigFolder, "custom_systems", "es_systems.xml")
        with open(custom_es_systems_path, "r") as f:
            xml_content = f.read()
            xml_content = self.preprocess_xml_for_comments(xml_content)
            custom_es_systems = xmltodict.parse(xml_content)

        self.es_systems = {}
        for system in es_systems['systemList']['system']:
            self.es_systems[system['name']] = system

        # TODO: Fix resolving later
        #for system in custom_es_systems['systemList']['system']:
        #   self.es_systems[system['name']] = system

    def preprocess_xml_for_comments(self, xml_content: str) -> str:
        result = []
        i = 0
        in_comment = False
        
        while i < len(xml_content):
            if not in_comment:
                if xml_content[i] == '<' and i + 3 < len(xml_content):
                    if xml_content[i:i+4] == '<!--':
                        in_comment = True
                        i += 4
                        continue
                result.append(xml_content[i])
                i += 1
            else:
                if xml_content[i] == '-' and i + 2 < len(xml_content):
                    if xml_content[i:i+3] == '-->':
                        in_comment = False
                        i += 3
                        continue
                i += 1
        
        return ''.join(result)

    def resolve_media_path(self, rom_path: str, system_name: str, media_type: str) -> str:
        filename = os.path.splitext(os.path.basename(rom_path))[0]

        file_ending = ".png"
        if media_type == "manuals":
            file_ending = ".pdf"

        image_path = os.path.join(
            "http://localhost:" + str(8089),
            "es-de-media",
            system_name,
            media_type,
            f"{filename}{file_ending}",
        )

        return image_path

    def resolve_emulator_name(self, system_name: str) -> list[str]:
        if system_name not in self.es_systems:
            return []

        commands = self.es_systems[system_name]['command']

        first_command = commands

        if isinstance(commands, list):
            first_command = commands[0]

        if(first_command['#text'].strip().startswith("%EMULATOR_RETROARCH%")):
            return ["RetroArch", first_command['@label'].strip()]

        return [first_command['@label'].strip()]

    def write_es_de_event_scripts(self):
        scripts = [
            ["game-start", "game_start_decky.sh"],
            ["game-end", "game_end_decky.sh"],
        ]

        for script_name, script_file in scripts:
            source = os.path.join(self.paths.pluginFolder, "scripts", script_name, script_file)
            with open(source, "r") as f:
                content = f.read()

            os.makedirs(
                os.path.join(self.paths.esDeConfigFolder, "scripts", script_name), 
                mode=0o755, 
                exist_ok=True
            )

            target = os.path.join(self.paths.esDeConfigFolder, "scripts", script_name, script_file)

            with open(target, "w") as f:
                f.write(content)
            os.chmod(target, 0o755)

    
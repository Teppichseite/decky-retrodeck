import asyncio
import uinput

class KeyEmitter:

    device: uinput.Device

    KEY_MAPPINGS = {
        name: getattr(uinput, name) for name in dir(uinput) if name.startswith("KEY_")
    }
    

    def __init__(self):
        self.device = uinput.Device(list(self.KEY_MAPPINGS.values()))

    async def press(self, keys: list[str]):
        self.hold(keys)
        await asyncio.sleep(0.1)
        self.release(keys)

    def hold(self, keys: list[str]):
        for key_str in keys:
            if key_str in self.KEY_MAPPINGS:
                key_code = self.KEY_MAPPINGS[key_str]
                self.device.emit(key_code, 1)

    def release(self, keys: list[str]):
        for key_str in keys:
            if key_str in self.KEY_MAPPINGS:
                key_code = self.KEY_MAPPINGS[key_str]
                self.device.emit(key_code, 0)
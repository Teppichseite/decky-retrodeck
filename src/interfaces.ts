export interface GameEvent {
    type: "game_start" | "game_end";
    path: string;
    name: string;
    system_name: string;
    full_system_name: string;
    image_path: string | null;
    manual_path: string | null;
    emulator_name: string[];
}

export interface Action {
    id: string;
    name: string;
    category?: string;
    icon: {
        type: "path" | "fa";
        value: string;
    };
    action: {
        type: "hotkey";
        operation: "hold" | "press";
        keys: string[];
    } | {
        type: "builtin";
        operation: "view_manual" | "exit";
    } | {
        type: "script";
        path: string;
    };
    systems: "*" | string[];
    emulators: "*" | (string | string[])[] ;
}

export interface PdfViewState {
    pageNumber: number;
    zoom: number;
    totalPages: number;
    position: {
        x: number;
        y: number;
    }
}

export interface SetupState {
    isRetrodeckFlatpakInstalled: boolean;
    areEsDeEventScriptsCreated: boolean;
}
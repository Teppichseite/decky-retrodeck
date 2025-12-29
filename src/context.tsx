import { createContext, useContext, ReactNode, useEffect } from "react";
import { Action, GameEvent } from "./interfaces";
import {
    addEventListener,
    removeEventListener,
} from "@decky/api"
import { adjustCategories, filterActions } from "./utils";
import { useBackendState } from "./hooks";
import { getActionsBe, runHotkeyActionBe } from "./backend";
import { Router } from "@decky/ui";

export interface MenuContextValue {
    actions: Action[];
    gameEvent: GameEvent | null;
    displayedActions: Action[];
    heldActions: string[];
    setGameEvent: (gameEvent: GameEvent | null) => void,
    handleAction: (action: Action) => void,
}

export const MenuContext = createContext<MenuContextValue>({
    actions: [],
    gameEvent: null,
    displayedActions: [],
    heldActions: [],
    setGameEvent: () => { },
    handleAction: () => { },
});

export interface MenuContextProviderProps {
    children: ReactNode;
}

export const MenuContextProvider = (props: MenuContextProviderProps) => {

    const [actions, setActions] = useBackendState<Action[]>("actions", []);
    const [displayedActions, setDisplayedActions] = useBackendState<Action[]>("displayed_actions", []);
    const [gameEvent, setGameEvent] = useBackendState<GameEvent | null>("game_event", null);
    const [heldActions, setHeldActions] = useBackendState<string[]>("held_actions", []);

    useEffect(() => {
        getActionsBe().then((actions) => {
            setActions(actions);
        });
    }, []);

    useEffect(() => {
        const listener = addEventListener<any>("game_event", (event) => {

            const parsedEvent: GameEvent = JSON.parse(event);

            console.log("Template got game_event with:", parsedEvent);

            if (parsedEvent.type === 'game_start') {
                setGameEvent(parsedEvent);
                return;
            }

            if (parsedEvent.type === 'game_end') {
                setGameEvent(null);
                return;
            }
        });

        return () => {
            removeEventListener("game_event", listener);
        };
    }, []);

    useEffect(() => {
        if (!gameEvent) {
            setDisplayedActions([]);
            return;
        }
        const filteredActions = filterActions(actions, gameEvent);
        const adjustedActions = adjustCategories(filteredActions);
        setDisplayedActions(adjustedActions);
    }, [gameEvent]);

    const handleAction = (action: Action) => {
        if (action.action.type != 'hotkey') {
            return;
        }

        const keys = action.action.keys;

        let type: 'hold' | 'press' | 'release' = action.action.operation;

        if (type === 'hold') {
            const isHeld = heldActions.includes(action.id);
            if (isHeld) {
                type = 'release';
                setHeldActions(heldActions.filter((a) => a != action.id));
            } else {
                type = 'hold';
                setHeldActions([...heldActions, action.id]);
            }
        }

        Router.CloseSideMenus();
        setTimeout(() => {
            runHotkeyActionBe(type, keys);
        }, 200);
    }

    const menuContextValue: MenuContextValue = {
        actions,
        gameEvent,
        displayedActions,
        heldActions,
        handleAction,
        setGameEvent,
    };

    return <MenuContext.Provider value={menuContextValue}>
        {props.children}
    </MenuContext.Provider>;
}

export const useMenuContext = () => {
    return useContext(MenuContext);
}

import { callable } from "@decky/api";
import { Action, GameEvent } from "./interfaces";

export const getActionsBe = callable<[], Action[]>("get_actions");
export const getGameEventBe = callable<[], GameEvent>("get_game_event");

export const getStateBe = callable<[string], string>("get_state");
export const setStateBe = callable<[string, string], void>("set_state");
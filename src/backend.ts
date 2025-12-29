import { callable } from "@decky/api";
import { Action } from "./interfaces";

export const getActionsBe = callable<[], Action[]>("get_actions");
export const runHotkeyActionBe = callable<[string, string[]], void>("run_hotkey_action");

export const getStateBe = callable<[string], string>("get_state");
export const setStateBe = callable<[string, string], void>("set_state");

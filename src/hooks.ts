// Taken from https://github.com/Teppichseite/DeckPass/blob/main/src/hooks.ts

import { useEffect, useState } from "react";
import { getStateBe, setStateBe } from "./backend";

export const useBackendState = <T>(key: string, initialValue: T): [T, (value: T) => Promise<void>] => {
  const [state, _setState] = useState<T>(initialValue);

  useEffect(() => {
    getStateBe(key)
      .then(result => {
        _setState(JSON.parse(result))
      });
  }, []);

  const setState = async (value: T) => {
    await setStateBe(key, JSON.stringify(value))
    _setState(value);
  };

  return [state ?? initialValue, setState];
}
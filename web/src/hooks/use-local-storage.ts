import { useCallback, useState } from "react";

type useSessionPersistenceReturn<S> = [
  value: S | undefined,
  setValue: (value: S | undefined) => void,
];

export function useLocalStorage<S>(
  key: string,
  defaultValue: S | undefined = undefined,
): useSessionPersistenceReturn<S> {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = window.localStorage.getItem(key);

      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (newValue: S | undefined) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
        // eslint-disable-next-line no-empty
      } catch (err) {}
      setStoredValue(newValue);
    },
    [key],
  );

  return [storedValue, setValue];
}

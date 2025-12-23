import { useCallback, useState } from "react";

type UseControllableStateParams<T> = {
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange?: (state: T) => void;
};

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultProp);
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (isControlled) {
        // When controlled, just call onChange
        if (nextValue !== prop && onChange) {
          onChange(nextValue);
        }
      } else {
        // When uncontrolled, update internal state and call onChange
        setUncontrolledValue(nextValue);
        if (nextValue !== value && onChange) {
          onChange(nextValue);
        }
      }
    },
    [isControlled, prop, onChange, value]
  );

  return [value, setValue] as const;
}

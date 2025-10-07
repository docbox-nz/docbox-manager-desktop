import { useEffect, useState } from "react";

/**
 * React hook for debouncing a value.
 *
 * @param value - The value to debounce (any type)
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler); // cancel timeout if value changes
  }, [value, delay]);

  return debouncedValue;
}

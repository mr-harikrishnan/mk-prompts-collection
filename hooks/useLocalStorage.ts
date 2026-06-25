import { useState, useEffect, useCallback, useRef } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Use initialValue as static state during hydration
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Keep a mutable ref of initialValue so useEffect dependencies can remain stable
  const initialValueRef = useRef(initialValue);
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        } else {
          window.localStorage.setItem(key, JSON.stringify(initialValueRef.current));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((currentVal) => {
        const valueToStore =
          value instanceof Function ? value(currentVal) : value;
        
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

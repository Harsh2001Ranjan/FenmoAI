import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value.
 * Why Debounce? In applications with search or real-time filtering, 
 * capturing every keystroke and firing an API request immediately is 
 * extremely wasteful. It causes "Network Spam" and UI "Lag" as results 
 * jump around. 
 * 
 * This hook creates a 'time buffer'—it waits for the user to stop 
 * interacting for X milliseconds before actually updating the 'debounced' 
 * value that the rest of the application reacts to.
 * 
 * @param {any} value The value to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {any} The debounced value.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Why the cleanup function? 
    // If the 'value' changes again before the 'delay' expires, 
    // we clear the previous timer. This effectively 'resets' the 
    // countdown, ensuring the value is only updated AFTER the user 
    // stops typing for the full duration of 'delay'.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

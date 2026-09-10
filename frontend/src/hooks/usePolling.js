import { useEffect, useRef } from 'react';

/**
 * Custom hook for periodic REST API polling with clean unmount lifecycle
 * @param {Function} fetchFn - Async callback function to execute on each tick
 * @param {number} intervalMs - Polling interval in milliseconds (default 5000ms)
 * @param {boolean} enabled - Whether polling is active
 */
export const usePolling = (fetchFn, intervalMs = 5000, enabled = true) => {
  const savedCallback = useRef(fetchFn);

  useEffect(() => {
    savedCallback.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    // Execute immediately on mount/enable
    const execute = async () => {
      try {
        await savedCallback.current();
      } catch (err) {
        console.error('Polling execution error:', err);
      }
    };

    execute();

    // Set up periodic interval
    const intervalId = setInterval(execute, intervalMs);

    // Clean up interval on component unmount or dependency change
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalMs, enabled]);
};

import { useEffect } from 'react';

/**
 * Hook to suppress hydration warnings caused by browser extensions
 * that inject attributes like 'fdprocessedid' into form elements
 */
export function useSuppressHydrationWarnings() {
  useEffect(() => {
    // Suppress specific hydration warnings caused by browser extensions
    const originalError = console.error;
    console.error = (...args) => {
      // Check if this is a hydration warning about extra attributes
      const message = args[0];
      if (
        typeof message === 'string' &&
        message.includes('Extra attributes from the server') &&
        message.includes('fdprocessedid')
      ) {
        // Suppress this specific warning
        return;
      }
      // Log all other errors normally
      originalError.apply(console, args);
    };

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);
}

"use client";

import { useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export const usePageLoadDetection = () => {
  const { setNavigationLoading, setComponentLoading } = useLoading();

  useEffect(() => {
    // Check if this is a heavy annotation page
    const isHeavyPage = window.location.pathname.includes('/dataPointExtraction') || 
                       window.location.pathname.includes('/textSegmentation');
    
    if (isHeavyPage) {
      // For heavy pages, only hide navigation loading, keep component loading
      const timer = setTimeout(() => {
        setNavigationLoading(false);
      }, 200); // Quick timeout for navigation loading
      
      return () => clearTimeout(timer);
    } else {
      // For simple pages, hide both loadings when DOM is ready
      const handleDOMReady = () => {
        setNavigationLoading(false);
        setComponentLoading(false);
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        handleDOMReady();
      } else {
        document.addEventListener('DOMContentLoaded', handleDOMReady);
      }

      // Fallback timeout for simple pages
      const timer = setTimeout(() => {
        setNavigationLoading(false);
        setComponentLoading(false);
      }, 1000);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('DOMContentLoaded', handleDOMReady);
      };
    }
  }, [setNavigationLoading, setComponentLoading]);
};

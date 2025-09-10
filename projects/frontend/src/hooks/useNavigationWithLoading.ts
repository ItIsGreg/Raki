"use client";

import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export const useNavigationWithLoading = () => {
  const router = useRouter();
  const { setNavigationLoading, setComponentLoading } = useLoading();

  const navigateWithLoading = (path: string) => {
    setNavigationLoading(true);
    setComponentLoading(true); // Start component loading for heavy pages
    
    // Reset component loading state to ensure it shows for new page
    setTimeout(() => {
      setComponentLoading(true);
    }, 10);
    
    // Minimal delay to show the loading spinner
    setTimeout(() => {
      router.push(path);
    }, 50);
  };

  const replaceWithLoading = (path: string) => {
    setNavigationLoading(true);
    setComponentLoading(true); // Start component loading for heavy pages
    
    // Reset component loading state to ensure it shows for new page
    setTimeout(() => {
      setComponentLoading(true);
    }, 10);
    
    // Minimal delay to show the loading spinner
    setTimeout(() => {
      router.replace(path);
    }, 50);
  };

  return {
    navigateWithLoading,
    replaceWithLoading,
  };
};

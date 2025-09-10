"use client";

import { useCallback } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export const useComponentReady = () => {
  const { setComponentLoading } = useLoading();

  const markComponentReady = useCallback(() => {
    setComponentLoading(false);
  }, [setComponentLoading]);

  return { markComponentReady };
};

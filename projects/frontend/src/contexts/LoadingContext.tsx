"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setNavigationLoading: (loading: boolean) => void;
  setComponentLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(false);

  const setNavigationLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setComponentLoading = (loading: boolean) => {
    setIsComponentLoading(loading);
  };

  const value: LoadingContextType = {
    isLoading,
    setIsLoading,
    setNavigationLoading,
    setComponentLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

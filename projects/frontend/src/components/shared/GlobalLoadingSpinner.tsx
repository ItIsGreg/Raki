"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLoading } from '@/contexts/LoadingContext';

export default function GlobalLoadingSpinner() {
  const { isLoading: authLoading } = useAuth();
  const { isLoading: navigationLoading, isComponentLoading } = useLoading();

  // Show loading spinner if auth, navigation, or component is loading
  const showLoading = authLoading || navigationLoading || isComponentLoading;

  if (!showLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-sm text-gray-600">
          {authLoading ? 'Checking authentication...' : 'Loading...'}
        </div>
      </div>
    </div>
  );
}

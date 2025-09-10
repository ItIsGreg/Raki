"use client";

import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleAuthConfig {
  clientId: string;
  onSuccess: (credential: string) => void;
  onError: (error: string) => void;
}

export const useGoogleAuth = (config: GoogleAuthConfig) => {
  const { clientId, onSuccess, onError } = config;

  const initializeGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined' || !window.google) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError('No credential received from Google');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      onError('Failed to initialize Google authentication');
    }
  }, [clientId, onSuccess, onError]);

  const renderGoogleButton = useCallback((elementId: string) => {
    if (typeof window === 'undefined' || !window.google) {
      return;
    }

    try {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: '100%',
        }
      );
    } catch (error) {
      console.error('Error rendering Google button:', error);
      onError('Failed to render Google sign-in button');
    }
  }, [onError]);

  const promptGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined' || !window.google) {
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Error prompting Google Auth:', error);
      onError('Failed to prompt Google authentication');
    }
  }, [onError]);

  useEffect(() => {
    // Wait for Google script to load
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleAuth();
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };

    checkGoogleLoaded();
  }, [initializeGoogleAuth]);

  return {
    renderGoogleButton,
    promptGoogleAuth,
  };
};

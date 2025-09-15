"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SettingsMenu from "@/components/llmSettings/SettingsMenu";
import { SettingsContext } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { StorageProvider } from "@/contexts/StorageContext";
import { checkForAppUpdates } from "@/lib/updater";
import { useSuppressHydrationWarnings } from "@/hooks/useSuppressHydrationWarnings";
import { usePageLoadDetection } from "@/hooks/usePageLoadDetection";
import TopNavbar from "@/components/layout/TopNavbar";
import GlobalLoadingSpinner from "@/components/shared/GlobalLoadingSpinner";

// Component that uses the page load detection hook inside the LoadingProvider
function PageLoadDetector() {
  usePageLoadDetection();
  return null;
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  // Suppress hydration warnings caused by browser extensions
  useSuppressHydrationWarnings();

  useEffect(() => {
    checkForAppUpdates();
  }, []);

  return (
    <AuthProvider>
      <StorageProvider>
        <LoadingProvider>
          <PageLoadDetector />
          <SettingsContext.Provider value={{ setIsSettingsOpen }}>
            <QueryClientProvider client={queryClient}>
              <div className="h-screen flex flex-col">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto">{children}</main>
                <SettingsMenu
                  isOpen={isSettingsOpen}
                  onClose={() => setIsSettingsOpen(false)}
                  autoRerunFaulty={true}
                  setAutoRerunFaulty={() => {}}
                />
                <GlobalLoadingSpinner />
              </div>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </SettingsContext.Provider>
        </LoadingProvider>
      </StorageProvider>
    </AuthProvider>
  );
}

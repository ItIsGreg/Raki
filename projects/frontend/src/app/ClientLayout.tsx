"use client";

import { useState, useEffect } from "react";
import SettingsMenu from "@/components/llmSettings/SettingsMenu";
import { SettingsContext } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { checkForAppUpdates } from "@/lib/updater";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    checkForAppUpdates();
  }, []);

  return (
    <AuthProvider>
      <SettingsContext.Provider value={{ setIsSettingsOpen }}>
        <main className="h-screen flex flex-col overflow-hidden">
          {children}
          <SettingsMenu
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            autoRerunFaulty={true}
            setAutoRerunFaulty={() => {}}
          />
        </main>
      </SettingsContext.Provider>
    </AuthProvider>
  );
}

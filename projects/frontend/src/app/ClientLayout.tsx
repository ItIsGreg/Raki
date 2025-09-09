"use client";

import { useState, useEffect } from "react";
import SettingsMenu from "@/components/llmSettings/SettingsMenu";
import { SettingsContext } from "@/contexts/SettingsContext";
import { checkForAppUpdates } from "@/lib/updater";
import TopNavbar from "@/components/layout/TopNavbar";

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
    <SettingsContext.Provider value={{ setIsSettingsOpen }}>
      <div className="h-screen flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <SettingsMenu
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          autoRerunFaulty={true}
          setAutoRerunFaulty={() => {}}
        />
      </div>
    </SettingsContext.Provider>
  );
}

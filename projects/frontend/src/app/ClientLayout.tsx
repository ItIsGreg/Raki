"use client";

import { useState, useEffect } from "react";
import SettingsMenu from "@/components/llmSettings/SettingsMenu";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { SettingsContext } from "@/contexts/SettingsContext";
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
    <SettingsContext.Provider value={{ setIsSettingsOpen }}>
      <main className="flex h-screen flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
        <LegalFooter />
        <SettingsMenu
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          autoRerunFaulty={true}
          setAutoRerunFaulty={() => {}}
        />
      </main>
    </SettingsContext.Provider>
  );
}

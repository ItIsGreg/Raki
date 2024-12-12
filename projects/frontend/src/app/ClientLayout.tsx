"use client";

import { useState } from "react";
import SettingsMenu from "@/components/llmSettings/SettingsMenu";
import { SettingsContext } from "@/contexts/SettingsContext";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SettingsContext.Provider value={{ setIsSettingsOpen }}>
      <main className="h-screen">
        {children}
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

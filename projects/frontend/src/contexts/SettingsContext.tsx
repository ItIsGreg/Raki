import { createContext, useContext, Dispatch, SetStateAction } from "react";

type SettingsContextType = {
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

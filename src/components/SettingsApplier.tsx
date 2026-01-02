import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";

/**
 * Component that applies all user settings to the document
 * Must be rendered inside SettingsProvider
 */
export const SettingsApplier = () => {
  const { appPreferences } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (appPreferences.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply font size
    root.dataset.fontSize = appPreferences.fontSize;

    // Apply language attribute
    root.setAttribute("lang", appPreferences.language);

    // Store preferences as data attributes for CSS/JS access
    root.dataset.soundEnabled = String(appPreferences.soundEnabled);
    root.dataset.vibrationEnabled = String(appPreferences.vibrationEnabled);

  }, [appPreferences]);

  // This component doesn't render anything
  return null;
};

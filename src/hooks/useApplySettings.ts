import { useEffect, useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";

/**
 * Hook that applies all app preferences globally
 * Call this once at the app root level
 */
export const useApplySettings = () => {
  const { appPreferences } = useSettings();

  // Apply all settings to document
  const applySettings = useCallback(() => {
    const root = document.documentElement;

    // Apply theme
    if (appPreferences.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply font size
    root.dataset.fontSize = appPreferences.fontSize;

    // Apply language (set lang attribute for accessibility/SEO)
    root.setAttribute("lang", appPreferences.language);

    // Store sound/vibration preferences for use by other components
    root.dataset.soundEnabled = String(appPreferences.soundEnabled);
    root.dataset.vibrationEnabled = String(appPreferences.vibrationEnabled);
  }, [appPreferences]);

  useEffect(() => {
    applySettings();
  }, [applySettings]);

  return { applySettings };
};

/**
 * Hook to play sound effects respecting user preferences
 */
export const useSoundEffect = () => {
  const { appPreferences } = useSettings();

  const playSound = useCallback((soundType: "click" | "success" | "error" | "notification") => {
    if (!appPreferences.soundEnabled) return;

    // Use Web Audio API for simple sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set sound parameters based on type
    switch (soundType) {
      case "click":
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      case "success":
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case "error":
        oscillator.frequency.value = 300;
        oscillator.type = "square";
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case "notification":
        oscillator.frequency.value = 440;
        oscillator.type = "sine";
        gainNode.gain.value = 0.12;
        oscillator.start();
        oscillator.frequency.linearRampToValueAtTime(660, audioContext.currentTime + 0.1);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
  }, [appPreferences.soundEnabled]);

  return { playSound };
};

/**
 * Hook to trigger vibration respecting user preferences
 */
export const useVibration = () => {
  const { appPreferences } = useSettings();

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (!appPreferences.vibrationEnabled) return;
    if (!navigator.vibrate) return;

    navigator.vibrate(pattern);
  }, [appPreferences.vibrationEnabled]);

  return { vibrate };
};

/**
 * Hook for unit conversions based on user preferences
 */
export const useUnitConversion = () => {
  const { appPreferences } = useSettings();

  const formatWeight = useCallback((valueInKg: number): string => {
    if (appPreferences.units.weight === "lbs") {
      return `${(valueInKg * 2.20462).toFixed(1)} lbs`;
    }
    return `${valueInKg.toFixed(1)} kg`;
  }, [appPreferences.units.weight]);

  const formatDistance = useCallback((valueInKm: number): string => {
    if (appPreferences.units.distance === "miles") {
      return `${(valueInKm * 0.621371).toFixed(2)} mi`;
    }
    return `${valueInKm.toFixed(2)} km`;
  }, [appPreferences.units.distance]);

  const formatHeight = useCallback((valueInCm: number): string => {
    if (appPreferences.units.height === "ft") {
      const totalInches = valueInCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${valueInCm} cm`;
  }, [appPreferences.units.height]);

  const parseWeight = useCallback((value: number): number => {
    // Convert from user's unit to kg for storage
    if (appPreferences.units.weight === "lbs") {
      return value / 2.20462;
    }
    return value;
  }, [appPreferences.units.weight]);

  const parseHeight = useCallback((value: number): number => {
    // Convert from user's unit to cm for storage
    if (appPreferences.units.height === "ft") {
      return value * 30.48; // feet to cm (approximate)
    }
    return value;
  }, [appPreferences.units.height]);

  return { 
    formatWeight, 
    formatDistance, 
    formatHeight,
    parseWeight,
    parseHeight,
    units: appPreferences.units 
  };
};

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export function useSpeechSynthesis() {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback(
    (text: string, opts: SpeakOptions = {}) => {
      if (!isSupported) return;
      if (!text.trim()) return;

      // Cancel any current speech
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      u.volume = opts.volume ?? 1;
      if (opts.lang) u.lang = opts.lang;

      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);

      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [isSupported]
  );

  // Cleanup
  useEffect(() => stop, [stop]);

  const state = useMemo(
    () => ({ isSupported, isSpeaking, speak, stop }),
    [isSupported, isSpeaking, speak, stop]
  );

  return state;
}

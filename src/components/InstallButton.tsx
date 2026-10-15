import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const markInstalled = () => {
  localStorage.setItem("hk-installed", "1");
  notify();
};

const runningAsApp = () =>
  ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].some(
    (m) => window.matchMedia(`(display-mode: ${m})`).matches,
  ) ||
  (navigator as unknown as { standalone?: boolean }).standalone === true ||
  document.referrer.startsWith("android-app://");

if (typeof window !== "undefined") {
  // Opening the installed app (any browser) remembers it for the browser tab too.
  if (runningAsApp()) localStorage.setItem("hk-installed", "1");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
    // Browser offers install again => it's not installed (e.g. was uninstalled).
    localStorage.removeItem("hk-installed");
    notify();
  });
  window.addEventListener("appinstalled", markInstalled);
}

const isChromium = () => /Chrome|Edg|CriOS/.test(navigator.userAgent);
// Chromium only offers install when the app is NOT installed; if no offer came, treat it as installed.
export const isInstalled = () =>
  runningAsApp() || localStorage.getItem("hk-installed") === "1" || (isChromium() && !isMobileDevice() && !deferred);

export const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

export const triggerInstall = async () => {
  if (isInstalled()) {
    toast.success("Health Kinetics is already installed on this device.");
    return;
  }
  if (isMobileDevice()) {
    toast.info("Coming Soon to Mobile Devices!");
    return;
  }
  if (deferred) {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === "accepted") markInstalled();
    return;
  }
  if (window.self !== window.top) {
    toast.info("Open the app in its own browser tab to install it.");
  } else if (/Safari/.test(navigator.userAgent) && !/Chrome|Edg/.test(navigator.userAgent)) {
    toast.info("In Safari, choose File → Add to Dock to install Health Kinetics.");
  } else if (/Firefox/.test(navigator.userAgent)) {
    toast.info("Firefox can't install apps yet. Please open healthkinetics.app in Chrome or Edge to install.");
  } else {
    toast.info("Click the install icon in your browser's address bar to install Health Kinetics.");
  }
};

export const useInstalled = () => {
  const [installed, setInstalled] = useState(true);
  useEffect(() => {
    const update = () => setInstalled(isInstalled());
    update();
    listeners.add(update);
    // Chromium browsers can confirm an installed copy of this app.
    const nav = navigator as unknown as { getInstalledRelatedApps?: () => Promise<unknown[]> };
    nav.getInstalledRelatedApps?.().then((apps) => { if (apps.length) markInstalled(); }).catch(() => {});
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", update);
    return () => { listeners.delete(update); mq.removeEventListener("change", update); };
  }, []);
  return installed;
};

const InstallButton = () => {
  const installed = useInstalled();
  if (installed) return null;
  return (
    <button
      onClick={triggerInstall}
      className="install-gold fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full px-5 min-h-[48px] font-bold shadow-lg"
    >
      <Download className="h-5 w-5" />
      Install Now!
    </button>
  );
};

export default InstallButton;

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
  });
}

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true ||
  localStorage.getItem("hk-installed") === "1";

const isMobile = () =>
  /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

const InstallButton = () => {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(isInstalled());
    const onInstalled = () => {
      localStorage.setItem("hk-installed", "1");
      setHidden(true);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (hidden) return null;

  const handleClick = async () => {
    if (isMobile()) {
      toast.info("Coming Soon to Mobile Devices!");
      return;
    }
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === "accepted") {
        localStorage.setItem("hk-installed", "1");
        setHidden(true);
      }
      return;
    }
    if (window.self !== window.top) {
      toast.info("Open the app in its own browser tab to install it.");
    } else {
      toast.info("Click the install icon in your browser's address bar (Chrome or Edge) to install Health Kinetics.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="install-gold fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full px-5 min-h-[48px] font-bold shadow-lg"
    >
      <Download className="h-5 w-5" />
      Install Now!
    </button>
  );
};

export default InstallButton;

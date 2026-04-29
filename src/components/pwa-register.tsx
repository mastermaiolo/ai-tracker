"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function PWARegister() {
  const { locale } = useLocale();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(checkIsStandalone);
  const [showBanner, setShowBanner] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("SW registered:", reg.scope);
        })
        .catch((err) => {
          console.log("SW registration failed:", err);
        });
    }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        {isInstalled ? (
          <Check className="h-5 w-5 text-emerald-500" />
        ) : (
          <Download className="h-5 w-5 text-amber-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{t(locale, "installApp")}</p>
        <p className="text-xs text-muted-foreground">{t(locale, "installAppDesc")}</p>
      </div>
      <Button
        size="sm"
        className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white"
        onClick={handleInstall}
      >
        {isInstalled ? t(locale, "installed") : t(locale, "installBtn")}
      </Button>
    </div>
  );
}

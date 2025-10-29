"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed before
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show banner after 3 seconds
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowBanner(false);
      localStorage.setItem("pwa-banner-dismissed", "true");
    }, 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border-2 border-green-600 p-4">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-green-600" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              حمّل تطبيق نائبك
            </h3>
            <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              احصل على تجربة أسرع وأسهل مع التطبيق
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 ml-2" />
                تحميل
              </Button>
              <Button
                onClick={handleClose}
                size="sm"
                variant="outline"
              >
                لاحقاً
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

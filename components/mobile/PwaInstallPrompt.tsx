"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone, Laptop, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // 1. Register service worker for PWA support
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] ServiceWorker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration error:", err);
        });
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      setIsStandalone(Boolean(isStandaloneMode));

      // Check if user previously dismissed prompt in this session
      const hasDismissed = sessionStorage.getItem("pwa_prompt_dismissed");
      if (hasDismissed) {
        setDismissed(true);
      }

      // Check if iOS
      const ua = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
      setIsIOS(isApple);

      // Listen for Chrome/Edge/Android beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        setInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        setTimeout(() => setDismissed(true), 3000);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (err) {
        console.error("[PWA] Error during prompt:", err);
      }
    } else {
      setShowInstructions(!showInstructions);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa_prompt_dismissed", "true");
    }
  };

  // Do not show if already running as an installed standalone app or dismissed
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Install NEC Portal Application"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />

        <div className="flex items-start gap-3.5">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 p-1 shadow-inner">
            <Image
              src="/nec-logo.png"
              alt="NEC Logo"
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-white tracking-tight">NEC Portal App</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-400/20">
                Official
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300 line-clamp-2">
              Install Nandha Engineering College portal on your device for instant access & offline capability.
            </p>

            {/* iOS specific instruction */}
            {isIOS && !isInstallable ? (
              <div className="mt-2.5 rounded-lg bg-white/5 p-2 text-[11px] text-slate-300 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>To install on iPhone / iPad:</span>
                </div>
                <p>
                  1. Tap the <strong className="text-white">Share</strong> button in Safari.
                </p>
                <p className="flex items-center gap-1">
                  2. Select <strong className="text-white flex items-center gap-1"><PlusSquare className="h-3 w-3 inline" /> Add to Home Screen</strong>.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-95 cursor-pointer"
                  >
                    {installed ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Installed!
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" /> Install App
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Smartphone className="h-3 w-3" />
                    <span>Mobile</span>
                    <span className="text-slate-600">•</span>
                    <Laptop className="h-3 w-3" />
                    <span>Desktop</span>
                  </div>
                </div>

                {showInstructions && !deferredPrompt && (
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1 animate-in fade-in">
                    <p className="font-semibold text-blue-300">How to install as App right now:</p>
                    <p>• <strong>Chrome / Edge:</strong> Click the <strong>Install (⊕)</strong> icon in your browser address bar or menu (⋮) → &quot;Install NEC Portal&quot;.</p>
                    <p>• <strong>Android / Mobile:</strong> Tap Menu (⋮) → &quot;Install app&quot; or &quot;Add to Home Screen&quot;.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function ServiceWorkerRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Temporarily disabled to fix API caching issues
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker.register("/sw.js");
    // }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        animation: "slideUp 0.4s ease-out",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          borderTop: "2px solid #c8a97e",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <img
            src="/icon-192.png"
            alt="Captain Purunchi"
            style={{ width: 44, height: 44, borderRadius: 10 }}
          />
          <div>
            <div style={{ color: "#c8a97e", fontWeight: 700, fontSize: 15 }}>
              Captain Purunchi
            </div>
            <div style={{ color: "#ccc", fontSize: 13 }}>
              Installez notre application pour un accès rapide
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{
              background: "transparent",
              border: "1px solid #555",
              color: "#999",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Plus tard
          </button>
          <button
            onClick={handleInstall}
            style={{
              background: "#c8a97e",
              border: "none",
              color: "#1a1a1a",
              padding: "8px 18px",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Installer
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

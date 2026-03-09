"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

export default function PageProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const prevPathRef = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    setFadeOut(false);
    setVisible(true);
  }, []);

  const completeLoading = useCallback(() => {
    setFadeOut(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setFadeOut(false);
    }, 500);
  }, []);

  // Detect route change completion
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      completeLoading();
      prevPathRef.current = pathname;
    }
  }, [pathname, completeLoading]);

  // Intercept link clicks to start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/api") &&
        href !== pathname &&
        !anchor.hasAttribute("download") &&
        anchor.target !== "_blank"
      ) {
        startLoading();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startLoading]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(13, 27, 42, 0.85)",
        backdropFilter: "blur(8px)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: "auto",
      }}
    >
      {/* Logo with pulse animation */}
      <div
        style={{
          animation: "logo-pulse 1.8s ease-in-out infinite",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <img
          src="/images%20captain/logo%20pour%20fond%20noir.png"
          alt="Captain Purunchi"
          style={{
            height: "80px",
            filter: "drop-shadow(0 4px 20px rgba(91, 192, 235, 0.4))",
          }}
        />

        {/* Animated dots */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#5BC0EB",
                animation: `dot-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

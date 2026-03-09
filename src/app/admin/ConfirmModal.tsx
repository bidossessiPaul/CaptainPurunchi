"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const iconMap = {
    danger: "iconoir-trash",
    warning: "iconoir-warning-triangle",
    primary: "iconoir-info-empty",
  };

  return createPortal(
    <>
      {/* Backdrop with blur */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "confirmFadeIn 0.2s ease",
        }}
        onClick={onCancel}
      />

      {/* Modal container */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            animation: "confirmSlideUp 0.25s ease",
          }}
        >
          {/* Icon area */}
          <div
            style={{
              padding: "32px 24px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background:
                  variant === "danger"
                    ? "rgba(220, 53, 69, 0.1)"
                    : variant === "warning"
                    ? "rgba(255, 193, 7, 0.1)"
                    : "rgba(111, 106, 248, 0.1)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <i
                className={`${iconMap[variant]} text-${variant}`}
                style={{ fontSize: "28px" }}
              />
            </div>
            <h6
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "#1a1d29",
                margin: "0 0 8px",
              }}
            >
              {title}
            </h6>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#f1f3f5", margin: "0 24px" }} />

          {/* Actions */}
          <div
            style={{
              padding: "16px 24px 24px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid #e2e5ea",
                background: "#fff",
                color: "#555b7e",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`btn btn-${variant}`}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
}

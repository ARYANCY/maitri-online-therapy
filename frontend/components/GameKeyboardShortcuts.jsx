import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function GameKeyboardShortcuts({ show = true }) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        zIndex: 10001,
        background: "rgba(255, 255, 255, 0.95)",
        border: "2px solid #667eea",
        borderRadius: "8px",
        padding: "1rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        maxWidth: "280px",
        fontSize: "0.875rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <strong style={{ color: "#667eea", fontSize: "1rem" }}>⌨️ Keyboard Shortcuts</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.25rem",
            cursor: "pointer",
            color: "#666",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#666" }}>Backspace</span>
          <kbd style={{ background: "#f8f9fa", padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>Undo</kbd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#666" }}>Enter</span>
          <kbd style={{ background: "#f8f9fa", padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>Submit</kbd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#666" }}>ESC</span>
          <kbd style={{ background: "#f8f9fa", padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid #e0e0e0" }}>Exit</kbd>
        </div>
      </div>
    </div>
  );
}


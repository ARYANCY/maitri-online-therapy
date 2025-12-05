import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function GameInstructions({ gameKey, onClose, onStart }) {
  const { t } = useTranslation();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const getGameInstructions = () => {
    const instructions = t(`dementia.games.instructions.${gameKey}`, [], { returnObjects: true });
    const benefits = t(`dementia.games.benefits.${gameKey}`, "");
    
    if (Array.isArray(instructions) && instructions.length > 0) {
      return instructions;
    }
    
    return [
      t("dementia.instruction1", "Follow the on-screen prompts"),
      t("dementia.instruction2", "Complete all rounds to finish"),
      t("dementia.instruction3", "Your performance will be assessed"),
    ];
  };

  const instructions = getGameInstructions();
  const gameTitle = t(`dementia.games.${gameKey}`, gameKey);
  const gameDescription = t(`dementia.games.descriptions.${gameKey}`, "");
  const cognitiveBenefits = t(`dementia.games.cognitiveBenefits.${gameKey}`, "");

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)', 
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '1rem'
      }}
      ref={overlayRef} 
      onClick={onClose}
    >
      <div 
        className="card shadow-lg border-0" 
        style={{ 
          maxWidth: '800px', 
          width: '100%', 
          maxHeight: '90vh', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="card-header border-0 text-white position-relative"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "24px 24px 0 0",
            padding: "2rem 1.5rem"
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-2 fw-bold">{gameTitle}</h2>
              {gameDescription && (
                <p className="mb-0 opacity-90" style={{ fontSize: "0.95rem" }}>
                  {gameDescription}
                </p>
              )}
            </div>
            <button 
              className="btn btn-light btn-sm rounded-circle" 
              onClick={onClose} 
              aria-label="Close"
              title="Close (ESC)"
              style={{ 
                minWidth: '40px', 
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Scrollable Body */}
        <div 
          className="card-body p-4"
          style={{ 
            overflowY: 'auto',
            flex: 1,
            background: "#f8fafc"
          }}
        >
          {/* How to Play */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="fs-3">📋</div>
              <h3 className="h5 mb-0 fw-bold">
                {t("dementia.howToPlay", "How to Play")}
              </h3>
            </div>
            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "white" }}>
              <div className="card-body p-4">
                <ol className="mb-0" style={{ paddingLeft: "1.5rem" }}>
                  {instructions.map((instruction, idx) => (
                    <li key={idx} className="mb-3" style={{ lineHeight: 1.7, color: "#475569" }}>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Cognitive Benefits */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="fs-3">🧠</div>
              <h3 className="h5 mb-0 fw-bold">
                {t("dementia.cognitiveBenefits", "Cognitive Benefits")}
              </h3>
            </div>
            <div 
              className="card border-0 shadow-sm"
              style={{ 
                borderRadius: "16px",
                background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                border: "2px solid #3b82f6"
              }}
            >
              <div className="card-body p-4">
                {cognitiveBenefits ? (
                  <p className="mb-0" style={{ lineHeight: 1.7, color: "#1e40af" }}>
                    {cognitiveBenefits}
                  </p>
                ) : (
                  <p className="mb-0" style={{ lineHeight: 1.7, color: "#1e40af" }}>
                    {t(`dementia.games.benefits.${gameKey}`, "This assessment helps evaluate cognitive function and working memory.")}
                  </p>
                )}
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {(() => {
                const domains = t(`dementia.games.domains.${gameKey}`, [], { returnObjects: true });
                if (Array.isArray(domains) && domains.length > 0) {
                  return domains.map((domain, idx) => (
                    <span 
                      key={idx} 
                      className="badge rounded-pill px-3 py-2"
                      style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}
                    >
                      {domain}
                    </span>
                  ));
                }
                return null;
              })()}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="fs-3">⌨️</div>
              <h4 className="h6 mb-0 fw-bold">
                Keyboard Shortcuts
              </h4>
            </div>
            <div className="card border-0 shadow-sm" style={{ borderRadius: "16px", background: "white" }}>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center border-0 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <kbd className="px-3 py-2 rounded" style={{ 
                        background: "black",
                        color: "white",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}>Backspace</kbd>
                    </div>
                    <small className="text-muted">Undo last action</small>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center border-0 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <kbd className="px-3 py-2 rounded" style={{ 
                        background: "black",
                        color: "white",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}>Enter</kbd>
                    </div>
                    <small className="text-muted">Submit answer</small>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center border-0 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <kbd className="px-3 py-2 rounded" style={{ 
                        background: "black",
                        color: "white",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}>ESC</kbd>
                    </div>
                    <small className="text-muted">Exit game</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="card-footer border-0 d-flex gap-3 justify-content-end p-4"
          style={{ background: "white", borderRadius: "0 0 24px 24px" }}
        >
          <button 
            className="btn btn-outline-secondary"
            onClick={onClose}
            style={{ 
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              fontWeight: 600
            }}
          >
            {t("dementia.close", "Close")} (ESC)
          </button>
          <button 
            className="btn btn-primary"
            onClick={onStart}
            style={{ 
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              border: "none",
              borderRadius: "12px",
              padding: "0.75rem 2rem",
              fontWeight: 600
            }}
          >
            {t("dementia.startGame", "Start Game")} →
          </button>
        </div>
      </div>
    </div>
  );
}

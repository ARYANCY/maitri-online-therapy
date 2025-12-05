import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function GameInstructions({ gameKey, onClose, onStart }) {
  const { t } = useTranslation();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        zIndex: 9999,
        padding: '1rem'
      }}
      ref={overlayRef} 
      onClick={onClose}
    >
      <div 
        className="card shadow-lg" 
        style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center position-relative">
          <h2 className="h4 mb-0">{gameTitle}</h2>
          <button 
            className="btn btn-sm btn-light" 
            onClick={onClose} 
            aria-label="Close"
            title="Close (ESC)"
            style={{ minWidth: '32px', height: '32px' }}
          >
            ×
          </button>
        
        <div className="card-body">
          {gameDescription && (
            <p className="text-muted mb-4">{gameDescription}</p>
          )}

          <div className="mb-4">
            <h3 className="h5 mb-3">
              <span className="me-2">📋</span>
              {t("dementia.howToPlay", "How to Play")}
            </h3>
            <ol className="list-group list-group-numbered">
              {instructions.map((instruction, idx) => (
                <li key={idx} className="list-group-item">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-4">
            <h3 className="h5 mb-3">
              <span className="me-2">🧠</span>
              {t("dementia.cognitiveBenefits", "Cognitive Benefits")}
            </h3>
            <div className="alert alert-info">
              {cognitiveBenefits ? (
                <p className="mb-0">{cognitiveBenefits}</p>
              ) : (
                <p className="mb-0">
                  {t(`dementia.games.benefits.${gameKey}`, "This assessment helps evaluate cognitive function and working memory.")}
                </p>
              )}
            </div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {(() => {
                const domains = t(`dementia.games.domains.${gameKey}`, [], { returnObjects: true });
                if (Array.isArray(domains) && domains.length > 0) {
                  return domains.map((domain, idx) => (
                    <span key={idx} className="badge bg-secondary">{domain}</span>
                  ));
                }
                return null;
              })()}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="h6 mb-3">⌨️ Keyboard Shortcuts</h4>
            <div className="list-group">
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <span><kbd>Backspace</kbd></span>
                <small className="text-muted">Undo last action</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <span><kbd>Enter</kbd></span>
                <small className="text-muted">Submit answer</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <span><kbd>ESC</kbd></span>
                <small className="text-muted">Exit game</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-light d-flex gap-2 justify-content-end">
          <button className="btn btn-primary" onClick={onStart}>
            {t("dementia.startGame", "Start Game")} →
          </button>
          <button className="btn btn-outline-secondary" onClick={onClose}>
            {t("dementia.close", "Close")} (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}


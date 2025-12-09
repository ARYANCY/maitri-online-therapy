import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../css/components/GameInstructions.css";

export default function GameInstructions({ gameKey, onClose, onStart }) {
  const { t } = useTranslation();
  const overlayRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (overlayRef.current) {
      overlayRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
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
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center game-instructions-overlay"
      ref={overlayRef} 
      onClick={onClose}
    >
      <div 
        className="card shadow-lg game-instructions-card" 
        style={{ 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <h3 className="h5 mb-1">{gameTitle}</h3>
            {gameDescription && (
              <p className="mb-0 small opacity-75">
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
              minWidth: '32px', 
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        <div className="card-body p-3" style={{ overflowY: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="d-flex flex-column h-100">
            <div className="mb-3 flex-shrink-0">
              <h5 className="mb-2">📋 {t("dementia.howToPlay", "How to Play")}</h5>
              <div className="card">
                <div className="card-body">
                  <ol className="mb-0 ps-3">
                    {instructions.map((instruction, idx) => (
                      <li key={idx} className="mb-2">
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="mb-3 flex-shrink-0">
              <h5 className="mb-2">🧠 {t("dementia.cognitiveBenefits", "Cognitive Benefits")}</h5>
              <div className="card border-info">
                <div className="card-body">
                  {cognitiveBenefits ? (
                    <p className="mb-0 small">
                      {cognitiveBenefits}
                    </p>
                  ) : (
                    <p className="mb-0 small">
                      {t(`dementia.games.benefits.${gameKey}`, "This assessment helps evaluate cognitive function and working memory.")}
                    </p>
                  )}
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {(() => {
                  const domains = t(`dementia.games.domains.${gameKey}`, [], { returnObjects: true });
                  if (Array.isArray(domains) && domains.length > 0) {
                    return domains.map((domain, idx) => (
                      <span key={idx} className="badge bg-primary">
                        {domain}
                      </span>
                    ));
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="mb-3 flex-shrink-0">
              <h6 className="mb-2">⌨️ Keyboard Shortcuts</h6>
              <div className="card">
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <kbd className="bg-dark text-white px-2 py-1 rounded">Backspace</kbd>
                      <small className="text-muted">Undo last action</small>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <kbd className="bg-dark text-white px-2 py-1 rounded">Enter</kbd>
                      <small className="text-muted">Submit answer</small>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <kbd className="bg-dark text-white px-2 py-1 rounded">ESC</kbd>
                      <small className="text-muted">Exit game</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-grow-1"></div>
          </div>
        </div>

        <div className="card-footer d-flex gap-2 justify-content-end flex-shrink-0">
          <button 
            className="btn btn-outline-secondary"
            onClick={onClose}
          >
            {t("dementia.close", "Close")} (ESC)
          </button>
          <button 
            className="btn btn-primary"
            onClick={onStart}
          >
            {t("dementia.startGame", "Start Game")} →
          </button>
        </div>
      </div>
    </div>
  );
}

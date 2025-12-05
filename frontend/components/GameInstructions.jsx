import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../css/game/GameInstructions.css";

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
    <div className="game-instructions-overlay" ref={overlayRef} onClick={onClose}>
      <div className="game-instructions-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="instructions-close-btn" 
          onClick={onClose} 
          aria-label="Close"
          title="Close (ESC)"
        >
          ×
        </button>
        
        <div className="instructions-header">
          <div className="game-icon-large">
            {t(`dementia.games.icons.${gameKey}`, "🎮")}
          </div>
          <h2 className="instructions-title">{gameTitle}</h2>
          {gameDescription && (
            <p className="instructions-description">{gameDescription}</p>
          )}
        </div>

        <div className="instructions-content">
          <div className="instructions-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              {t("dementia.howToPlay", "How to Play")}
            </h3>
            <ul className="instructions-list">
              {instructions.map((instruction, idx) => (
                <li key={idx}>
                  <span className="instruction-number">{idx + 1}</span>
                  <span className="instruction-text">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="instructions-section">
            <h3 className="section-title">
              <span className="section-icon">🧠</span>
              {t("dementia.cognitiveBenefits", "Cognitive Benefits")}
            </h3>
            <div className="benefits-content">
              {cognitiveBenefits ? (
                <p className="benefits-text">{cognitiveBenefits}</p>
              ) : (
                <p className="benefits-text">
                  {t(`dementia.games.benefits.${gameKey}`, "This assessment helps evaluate cognitive function and working memory.")}
                </p>
              )}
            </div>
            <div className="cognitive-domains">
              {(() => {
                const domains = t(`dementia.games.domains.${gameKey}`, [], { returnObjects: true });
                if (Array.isArray(domains) && domains.length > 0) {
                  return domains.map((domain, idx) => (
                    <span key={idx} className="domain-badge">{domain}</span>
                  ));
                }
                return null;
              })()}
            </div>
          </div>

          <div className="keyboard-shortcuts-info">
            <h4 className="shortcuts-title">⌨️ Keyboard Shortcuts</h4>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <kbd>Backspace</kbd>
                <span>Undo last action</span>
              </div>
              <div className="shortcut-item">
                <kbd>Enter</kbd>
                <span>Submit answer</span>
              </div>
              <div className="shortcut-item">
                <kbd>ESC</kbd>
                <span>Exit game</span>
              </div>
            </div>
          </div>
        </div>

        <div className="instructions-footer">
          <button className="btn-start-game" onClick={onStart}>
            {t("dementia.startGame", "Start Game")} →
          </button>
          <button className="btn-close-instructions" onClick={onClose}>
            {t("dementia.close", "Close")} (ESC)
          </button>
        </div>
      </div>
    </div>
  );
}


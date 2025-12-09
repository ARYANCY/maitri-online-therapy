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

  // Domain-specific research papers mapping
  const domainResearchPapers = {
    memory: [
      { label: "Baddeley & Hitch (1974) – Working Memory Model", url: "https://doi.org/10.1016/S0079-7421(08)60452-1" },
      { label: "Eichenbaum (2000) – Hippocampal Memory Systems", url: "https://doi.org/10.1016/S0896-6273(00)00046-3" },
      { label: "Squire & Wixted (2011) – Memory Systems Review", url: "https://doi.org/10.1146/annurev-neuro-061010-113706" },
      { label: "Paller & Wagner (2002) – Memory Consolidation", url: "https://doi.org/10.1016/S1364-6613(02)01904-6" },
    ],
    attention: [
      { label: "Posner & Petersen (1990) – Attention Systems", url: "https://doi.org/10.1146/annurev.ne.13.030190.001245" },
      { label: "Corbetta & Shulman (2002) – Control of Goal-Directed Attention", url: "https://doi.org/10.1038/nrn755" },
      { label: "Fan et al. (2002) – Attention Network Test", url: "https://doi.org/10.1162/089892902317361886" },
      { label: "Hick (1952) – Decision Time and Attention", url: "https://doi.org/10.1080/14786445208532764" },
    ],
    executive: [
      { label: "Miyake et al. (2000) – Executive Functions", url: "https://doi.org/10.1006/cogp.1999.0734" },
      { label: "Diamond (2013) – Executive Functions Review", url: "https://doi.org/10.1146/annurev-psych-113011-143750" },
      { label: "Stroop (1935) – Interference and Inhibition", url: "https://doi.org/10.1037/h0054651" },
      { label: "MacLeod (1991) – Stroop Effect Review", url: "https://doi.org/10.1037/0033-2909.109.2.163" },
    ],
    language: [
      { label: "Levelt (1999) – Language Production", url: "https://doi.org/10.1016/S0010-0277(99)00007-1" },
      { label: "Price (2012) – Language Networks", url: "https://doi.org/10.1016/j.cortex.2011.05.014" },
      { label: "Hickok & Poeppel (2007) – Language Processing", url: "https://doi.org/10.1016/j.cognition.2006.06.001" },
    ],
    orientation: [
      { label: "Shulman (2000) – Clock Drawing Test for Dementia", url: "https://doi.org/10.1002/(SICI)1099-1166(200004)15:4<299::AID-GPS146>3.0.CO;2-U" },
      { label: "Moore et al. (2017) – Clock Drawing Test Review", url: "https://doi.org/10.1097/WAD.0000000000000208" },
      { label: "Sunderland et al. (1989) – Clock Drawing in Dementia", url: "https://doi.org/10.1016/0028-3932(89)90066-4" },
    ],
  };

  // Game to domain mapping (matches backend cognitiveDomainMapper.js)
  const gameDomainMapping = {
    digit_span: { domains: ['memory', 'attention'], weights: { memory: 0.8, attention: 0.2 } },
    n_back: { domains: ['memory', 'executive'], weights: { memory: 0.6, executive: 0.4 } },
    pattern_recall: { domains: ['memory', 'attention'], weights: { memory: 0.7, attention: 0.3 } },
    memory: { domains: ['memory', 'executive'], weights: { memory: 0.75, executive: 0.25 } },
    reaction_time: { domains: ['attention', 'executive'], weights: { attention: 0.7, executive: 0.3 } },
    color_sequence: { domains: ['memory', 'executive'], weights: { memory: 0.6, executive: 0.4 } },
    stroop_test: { domains: ['executive', 'attention'], weights: { executive: 0.8, attention: 0.2 } },
    clock_drawing: { domains: ['executive', 'orientation', 'memory'], weights: { executive: 0.5, orientation: 0.3, memory: 0.2 } },
    symbol_match: { domains: ['memory', 'attention'], weights: { memory: 0.6, attention: 0.4 } },
    matching_cards: { domains: ['memory', 'attention'], weights: { memory: 0.8, attention: 0.2 } },
  };

  // Get domain-specific research papers for this game
  const getDomainResearchPapers = () => {
    const gameMapping = gameDomainMapping[gameKey];
    if (!gameMapping) return [];

    const papers = [];
    const seenLabels = new Set();

    gameMapping.domains.forEach((domain, index) => {
      const domainPapers = domainResearchPapers[domain] || [];
      const weight = gameMapping.weights[domain] || 0;
      const isPrimary = index === 0;

      domainPapers.forEach(paper => {
        // Avoid duplicates
        if (!seenLabels.has(paper.label)) {
          seenLabels.add(paper.label);
          papers.push({
            ...paper,
            domain: domain.charAt(0).toUpperCase() + domain.slice(1),
            weight: weight,
            isPrimary: isPrimary
          });
        }
      });
    });

    // Sort by primary domain first, then by weight
    return papers.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return b.weight - a.weight;
    });
  };

  const researchForGame = getDomainResearchPapers();

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
              <h6 className="mb-2">📑 {t("dementia.researchBasis", "Research Basis")} - {t("dementia.domainSpecific", "Domain-Specific Papers")}</h6>
              <div className="card">
                <div className="card-body">
                  {researchForGame.length > 0 ? (
                    <div className="small">
                      {(() => {
                        // Group papers by domain
                        const papersByDomain = {};
                        researchForGame.forEach(paper => {
                          if (!papersByDomain[paper.domain]) {
                            papersByDomain[paper.domain] = [];
                          }
                          papersByDomain[paper.domain].push(paper);
                        });

                        return Object.entries(papersByDomain).map(([domain, papers]) => (
                          <div key={domain} className="mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <span className="badge bg-primary me-2">{domain}</span>
                              <small className="text-muted">
                                ({Math.round((gameDomainMapping[gameKey]?.weights[domain.toLowerCase()] || 0) * 100)}% weight)
                              </small>
                            </div>
                            <ul className="mb-0 ps-3">
                              {papers.map((ref, idx) => (
                                <li key={idx} className="mb-1">
                                  <a 
                                    href={ref.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-decoration-none"
                                    style={{ fontSize: '0.875rem' }}
                                  >
                                    {ref.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <p className="mb-0 small text-muted">
                      {t("dementia.researchFallback", "Based on validated neuropsychological assessment literature for the targeted cognitive domain.")}
                    </p>
                  )}
                </div>
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

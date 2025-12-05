import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../utils/axiosClient";
import "../css/pages/AboutMaitri.css";
import { useTranslation } from "react-i18next";
import WhatIsDementia from "./WhatIsDementia";
import LearnOurMission from "./LearnOurMission";

export default function AboutMaitri() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dementia"); 

  const fetchUser = useCallback(async () => {
    try {
      const data = await API.auth.checkSession();
      
      if (!data?.success || !data?.user) {
        window.location.href = "/";
        return;
      }
      setUser(data.user);
      
      
      try {
        localStorage.setItem("userId", data.user._id || "");
        localStorage.setItem("userEmail", data.user.email || "");
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("isAdmin", data.user.isAdmin ? "true" : "false");
        localStorage.setItem("sessionTime", Date.now().toString());
      } catch (storageErr) {
        console.error(`[SESSION ERROR] Failed to store session (AboutMaitri.jsx):`, {
          error: storageErr.message,
          name: storageErr.name,
          code: storageErr.code,
          stack: storageErr.stack,
          userId: data.user._id
        });
      }
    } catch (err) {
      console.error(`[SESSION ERROR] Session check failed (AboutMaitri.jsx):`, {
        message: err.message,
        name: err.name,
        stack: err.stack,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(
        t("dashboard.error.sessionCheckFailed", "Session check failed:") + " " + err.message
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="about-maitri-page">
        <Navbar user={user} />
        <div className="navbar-spacer"></div>
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: "60vh"}}>
          <div className="spinner-border text-primary" role="status" aria-label={t("dashboard.loading", "Loading...")}>
            <span className="visually-hidden">{t("dashboard.loading", "Loading...")}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="about-maitri-page">
        <Navbar user={user} />
        <div className="navbar-spacer"></div>
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-maitri-page">
      <Navbar user={user} />
      <div className="navbar-spacer"></div>
      <div className="about-maitri-container">
        
        <section className="maitri-hero card shadow-lg border-0 mb-4 mb-md-5" aria-labelledby="hero-title">
          <div className="card-body p-4 p-md-5 text-center">
            <h1 id="hero-title" className="display-4 fw-bold mb-3 mb-md-4">
              {t("aboutMaitri.heroTitle", "About Maitri")}
            </h1>
            <p className="lead fw-semibold mb-3 mb-md-4">
              {t("aboutMaitri.heroSubtitle", "A Comprehensive Digital Platform for Dementia Assessment and Cognitive Health Monitoring")}
            </p>
            <p className="fs-5 mb-0 mx-auto" style={{maxWidth: "900px"}}>
              {t("aboutMaitri.heroDescription", "Maitri leverages evidence-based cognitive assessments and AI-powered analytics to provide early detection, risk assessment, and monitoring tools for dementia and cognitive decline. Our platform combines scientific rigor with accessible technology to support individuals, families, and healthcare professionals.")}
            </p>
          </div>
        </section>

        
        <div className="tab-navigation-wrapper mb-4 mb-md-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "dementia" ? "active" : ""}`}
                    onClick={() => setActiveTab("dementia")}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "dementia"}
                    aria-controls="dementia-tab"
                    id="dementia-tab-btn"
                  >
                    <span className="tab-icon">🧠</span>
                    <span className="tab-text">{t("aboutMaitri.tabs.whatIsDementia", "What is Dementia?")}</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "mission" ? "active" : ""}`}
                    onClick={() => setActiveTab("mission")}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "mission"}
                    aria-controls="mission-tab"
                    id="mission-tab-btn"
                  >
                    <span className="tab-icon">🎯</span>
                    <span className="tab-text">{t("aboutMaitri.tabs.learnOurMission", "Learn Our Mission")}</span>
                  </button>
                      </li>
                  </ul>
                  </div>
                </div>
              </div>

        
        <div className="tab-content-wrapper">
          <div 
            className={`tab-pane fade ${activeTab === "dementia" ? "show active" : ""}`}
            role="tabpanel"
            aria-labelledby="dementia-tab-btn"
            id="dementia-tab"
          >
            <WhatIsDementia />
          </div>
          <div 
            className={`tab-pane fade ${activeTab === "mission" ? "show active" : ""}`}
            role="tabpanel"
            aria-labelledby="mission-tab-btn"
            id="mission-tab"
          >
            <LearnOurMission />
            </div>
          </div>

        
          <section className="scientific-evidence card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="scientific-evidence-title">
            <div className="card-body p-4 p-md-5">
              <h2 id="scientific-evidence-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
                {t("aboutMaitri.scientificEvidenceTitle", "Scientific Foundation & Evidence Base")}
              </h2>
              <p className="lead text-center mb-4 mb-md-5 mx-auto" style={{maxWidth: "800px"}}>
                {t("aboutMaitri.evidenceIntro", "Our assessment protocols are grounded in peer-reviewed research and validated neuropsychological testing methodologies. The platform integrates principles from:")}
              </p>
              
              <div className="row g-4 mb-5">
              <div className="col-md-6">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body">
                    <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.scientificPrinciples.neuropsychology.title", "Neuropsychological Assessment")}</h4>
                    <p className="small mb-0">{t("aboutMaitri.scientificPrinciples.neuropsychology.description", "Based on established neuropsychological testing paradigms validated in clinical research settings.")}</p>
                  </div>
                </div>
            </div>
              <div className="col-md-6">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body">
                    <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.scientificPrinciples.cognitive.title", "Cognitive Domain Theory")}</h4>
                    <p className="small mb-0">{t("aboutMaitri.scientificPrinciples.cognitive.description", "Assessment framework based on established models of cognitive function and domain-specific evaluation.")}</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </section>

        
        <section className="clinical-considerations card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="clinical-title">
          <div className="card-body p-4 p-md-5">
            <h2 id="clinical-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
              {t("aboutMaitri.clinicalTitle", "Clinical Considerations & Limitations")}
            </h2>
            <div className="clinical-warning alert alert-warning mb-4" role="alert">
              <div className="d-flex align-items-start gap-3">
                <div className="fs-3 flex-shrink-0" aria-hidden="true">⚠️</div>
                <div className="warning-content">
                  <h3 className="h5 fw-bold mb-2">{t("aboutMaitri.warningTitle", "Important Medical Disclaimer")}</h3>
                  <p className="mb-0">
                    {t("aboutMaitri.warningText", "The assessments provided on this platform are designed for screening and self-assessment purposes only. They are not intended to replace professional medical evaluation, diagnosis, or treatment. Results should be interpreted by qualified healthcare professionals in conjunction with comprehensive clinical assessment, medical history, and appropriate diagnostic testing.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="maitri-faqs card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="faqs-title">
          <div className="card-body p-4 p-md-5">
            <h2 id="faqs-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
              {t("aboutMaitri.faqsTitle", "Frequently Asked Questions")}
            </h2>
            <div className="accordion" id="faqAccordion">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const question = t(`aboutMaitri.faq${num}.question`, `FAQ ${num} Question`);
                const answer = t(`aboutMaitri.faq${num}.answer`, `FAQ ${num} Answer`);
                if (question === `FAQ ${num} Question` && answer === `FAQ ${num} Answer`) return null;
                return (
                  <div key={num} className="accordion-item mb-3">
                    <h3 className="accordion-header">
                      <button 
                        className="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#faq${num}`}
                        aria-expanded="false"
                        aria-controls={`faq${num}`}
                      >
                        {question}
                      </button>
                    </h3>
                    <div 
                      id={`faq${num}`} 
                      className="accordion-collapse collapse" 
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        {answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        
        <section className="maitri-survey card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="survey-title">
          <div className="card-body p-4 p-md-5">
            <h2 id="survey-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
              {t("aboutMaitri.surveyTitle", "Help Us Improve")}
            </h2>
            <p className="lead text-center mb-4 mb-md-5 mx-auto" style={{maxWidth: "800px"}}>
              {t("aboutMaitri.surveyIntro", "Please complete this survey so we can collect accurate data. Your input will help us improve the website and better align it with your needs.")}
            </p>
            <div className="survey-container">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSeDqajk6TR-TEea6jaXX00cHj5RJPxQJnbDK6ir9Xznd-hFtQ/viewform?embedded=true"
                width="100%"
                height="800"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                title={t("aboutMaitri.surveyTitle", "Dementia Screening Survey")}
                className="survey-iframe"
                allow="fullscreen"
                loading="lazy"
                style={{ minHeight: '600px', border: 'none', borderRadius: '8px' }}
              >
                <p style={{ textAlign: 'center', padding: '2rem' }}>
                  {t("aboutMaitri.surveyIframeError", "If the form doesn't load, please ")}
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeDqajk6TR-TEea6jaXX00cHj5RJPxQJnbDK6ir9Xznd-hFtQ/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--soft-jade)', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    {t("aboutMaitri.surveyLink", "open the survey in a new tab")}
                  </a>
                  .
                </p>
              </iframe>
            </div>
          </div>
        </section>

        
        <section className="maitri-medico card shadow-lg border-0 mb-4 mb-md-5 bg-primary text-white" aria-labelledby="medico-title">
          <div className="card-body p-4 p-md-5 text-center">
            <h2 id="medico-title" className="display-5 fw-bold mb-3 mb-md-4">{t("aboutMaitri.medicoTitle", "Maitri Medico")}</h2>
            <p className="lead mb-4 mb-md-5 mx-auto" style={{maxWidth: "700px"}}>
              {t("aboutMaitri.medicoDescription", "Access additional mental health resources, guidance, and support through Maitri Medico—our comprehensive mental health companion platform.")}
            </p>
            <a 
              href="https://maitri-medico.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-light btn-lg px-5"
              aria-label={t("aboutMaitri.medicoButton", "Visit Maitri Medico")}
            >
              {t("aboutMaitri.medicoButton", "Visit Maitri Medico")} →
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

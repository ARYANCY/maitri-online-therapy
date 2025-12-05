import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function LearnOurMission() {
  const { t } = useTranslation();

  const getArray = useCallback((key) => {
    const value = t(key, [], { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  
  const userGrowthData = useMemo(() => ({
    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    datasets: [{
      label: t("aboutMaitri.missionCharts.usersServed", "Users Served (Thousands)"),
      data: [5, 15, 35, 65, 120, 200],
      borderColor: '#6FAE9A',
      backgroundColor: 'rgba(111, 174, 154, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 10,
      pointBackgroundColor: '#6FAE9A',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2
    }]
  }), [t]);

  
  const assessmentCompletionData = useMemo(() => ({
    labels: [
      t("aboutMaitri.missionCharts.memory", "Memory"),
      t("aboutMaitri.missionCharts.attention", "Attention"),
      t("aboutMaitri.missionCharts.executive", "Executive"),
      t("aboutMaitri.missionCharts.visuospatial", "Visuospatial"),
      t("aboutMaitri.missionCharts.language", "Language")
    ],
    datasets: [{
      label: t("aboutMaitri.missionCharts.completionRate", "Completion Rate (%)"),
      data: [92, 88, 85, 90, 87],
      backgroundColor: [
        'rgba(111, 174, 154, 0.9)',
        'rgba(143, 196, 180, 0.9)',
        'rgba(168, 213, 196, 0.9)',
        'rgba(193, 230, 212, 0.9)',
        'rgba(111, 174, 154, 0.9)'
      ],
      borderColor: [
        '#6FAE9A',
        '#8FC4B4',
        '#A8D5C4',
        '#C1E6D4',
        '#6FAE9A'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  }), [t]);

  
  const featuresImpactData = useMemo(() => ({
    labels: [
      t("aboutMaitri.missionCharts.earlyDetection", "Early Detection"),
      t("aboutMaitri.missionCharts.monitoring", "Monitoring"),
      t("aboutMaitri.missionCharts.support", "Support"),
      t("aboutMaitri.missionCharts.education", "Education"),
      t("aboutMaitri.missionCharts.research", "Research")
    ],
    datasets: [{
      label: t("aboutMaitri.missionCharts.impactScore", "Impact Score"),
      data: [95, 90, 88, 85, 82],
      backgroundColor: [
        'rgba(227, 154, 76, 0.9)',
        'rgba(227, 154, 76, 0.85)',
        'rgba(227, 154, 76, 0.8)',
        'rgba(227, 154, 76, 0.75)',
        'rgba(227, 154, 76, 0.7)'
      ],
      borderColor: '#D38A3C',
      borderWidth: 2,
      borderRadius: 8
    }]
  }), [t]);

  
  const globalReachData = useMemo(() => ({
    labels: [
      t("aboutMaitri.missionCharts.northAmerica", "North America"),
      t("aboutMaitri.missionCharts.europe", "Europe"),
      t("aboutMaitri.missionCharts.asia", "Asia"),
      t("aboutMaitri.missionCharts.africa", "Africa"),
      t("aboutMaitri.missionCharts.southAmerica", "South America"),
      t("aboutMaitri.missionCharts.oceania", "Oceania")
    ],
    datasets: [{
      data: [35, 28, 22, 8, 5, 2],
      backgroundColor: [
        '#6FAE9A',
        '#8FC4B4',
        '#A8D5C4',
        '#C1E6D4',
        '#DAF7E4',
        '#E39A4C'
      ],
      borderColor: '#FFFFFF',
      borderWidth: 3,
      hoverOffset: 10
    }]
  }), [t]);

  
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 13,
            family: 'Inter, sans-serif',
            weight: '500'
          },
          color: '#1C1C1C',
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 28, 0.95)',
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif',
          weight: '600'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif'
        },
        padding: 14,
        cornerRadius: 10,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          color: '#5A5A5A',
          padding: 10
        },
        grid: {
          color: 'rgba(230, 230, 230, 0.8)',
          lineWidth: 1
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          color: '#5A5A5A',
          padding: 10
        },
        grid: {
          color: 'rgba(230, 230, 230, 0.5)',
          display: false
        }
      }
    }
  }), []);

  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 13,
            family: 'Inter, sans-serif',
            weight: '500'
          },
          color: '#1C1C1C',
          padding: 18,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(28, 28, 28, 0.95)',
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif',
          weight: '600'
        },
        bodyFont: {
          size: 13,
          family: 'Inter, sans-serif'
        },
        padding: 14,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}% (${percentage}% of total)`;
          }
        }
      }
    }
  }), []);

  
  const features = useMemo(() => {
    const feat = getArray("aboutMaitri.features");
    if (feat.length > 0) return feat;
    const defaultFeat = getArray("aboutMaitri.defaultFeatures");
    if (defaultFeat.length > 0) return defaultFeat;
    return null;
  }, [getArray]);

  
  const cognitiveDomains = useMemo(() => {
    const domains = getArray("aboutMaitri.cognitiveDomains");
    if (domains.length > 0) return domains;
    const defaultDomains = getArray("aboutMaitri.defaultCognitiveDomains");
    if (defaultDomains.length > 0) return defaultDomains;
    return null;
  }, [getArray]);

  return (
    <div className="learn-our-mission">
      
      <section className="maitri-mission card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="mission-section">
        <div className="card-body p-4 p-md-5">
          <div className="row g-4">
            <div className="col-md-6">
              <h2 id="mission-section" className="h3 fw-bold mb-3">{t("aboutMaitri.missionTitle", "Our Mission")}</h2>
              <p className="fs-6 lh-lg mb-0">
                {t("aboutMaitri.missionDescription", "To provide accessible, evidence-based cognitive assessment tools that enable early detection of dementia risk, support clinical decision-making, and empower individuals and families to take proactive steps in cognitive health management.")}
              </p>
            </div>
            <div className="col-md-6">
              <h2 className="h3 fw-bold mb-3">{t("aboutMaitri.visionTitle", "Our Vision")}</h2>
              <p className="fs-6 lh-lg mb-0">
                {t("aboutMaitri.visionDescription", "A world where early detection and intervention for dementia are accessible to all, reducing the global burden of cognitive decline through technology-enabled assessment, monitoring, and support.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="mission-impact card shadow-sm border-0 mb-4 mb-md-5">
        <div className="card-body p-4 p-md-5">
          <h2 className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
            {t("aboutMaitri.missionImpactTitle", "Our Impact & Reach")}
          </h2>
          
          <div className="row g-4 mb-5">
            <div className="col-lg-6">
              <div className="chart-container" style={{ height: '350px' }}>
                <h4 className="h6 fw-semibold mb-3">
                  {t("aboutMaitri.missionCharts.userGrowth", "User Growth Over Time")}
                </h4>
                <Line data={userGrowthData} options={chartOptions} />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="chart-container" style={{ height: '350px' }}>
                <h4 className="h6 fw-semibold mb-3">
                  {t("aboutMaitri.missionCharts.globalReach", "Global Reach Distribution")}
                </h4>
                <Doughnut data={globalReachData} options={pieChartOptions} />
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="chart-container" style={{ height: '350px' }}>
                <h4 className="h6 fw-semibold mb-3">
                  {t("aboutMaitri.missionCharts.assessmentCompletion", "Assessment Completion Rates")}
                </h4>
                <Bar data={assessmentCompletionData} options={chartOptions} />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="chart-container" style={{ height: '350px' }}>
                <h4 className="h6 fw-semibold mb-3">
                  {t("aboutMaitri.missionCharts.featuresImpact", "Platform Features Impact")}
                </h4>
                <Bar data={featuresImpactData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="cognitive-assessment card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="assessment-title">
        <div className="card-body p-4 p-md-5">
          <h2 id="assessment-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
            {t("aboutMaitri.assessmentTitle", "Cognitive Assessment Framework")}
          </h2>
          <p className="lead text-center mb-4 mb-md-5 mx-auto" style={{maxWidth: "800px"}}>
            {t("aboutMaitri.assessmentIntro", "Our platform employs validated cognitive assessment tools based on established neuropsychological testing paradigms. Each assessment is designed to evaluate specific cognitive domains:")}
          </p>
          
          <div className="row g-4">
            {cognitiveDomains ? (
              cognitiveDomains.map((domain, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="domain-card card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="domain-icon fs-1 mb-3 text-center" aria-hidden="true">{domain.icon || "🧠"}</div>
                      <h3 className="h5 fw-bold mb-3">{domain.name || "Cognitive Domain"}</h3>
                      <p className="small mb-3">{domain.description || "Domain description"}</p>
                      {domain.tests && Array.isArray(domain.tests) && domain.tests.length > 0 && (
                        <ul className="list-unstyled mb-0">
                          {domain.tests.map((test, testIdx) => (
                            <li key={testIdx} className="small mb-1">
                              <span className="badge bg-secondary me-2" aria-hidden="true">•</span>
                              {test}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="col-md-6 col-lg-4">
                  <div className="domain-card card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="domain-icon fs-1 mb-3 text-center" aria-hidden="true">🧠</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultDomains.memory.name", "Memory")}</h3>
                      <p className="small mb-3">{t("aboutMaitri.defaultDomains.memory.description", "Assessment of short-term, long-term, and working memory capabilities through various recall and recognition tasks.")}</p>
                      <ul className="list-unstyled mb-0">
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.memory.test1", "Digit Span Test")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.memory.test2", "Memory Match Game")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.memory.test3", "Word Recall Assessment")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="domain-card card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="domain-icon fs-1 mb-3 text-center" aria-hidden="true">⚡</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultDomains.attention.name", "Attention & Processing Speed")}</h3>
                      <p className="small mb-3">{t("aboutMaitri.defaultDomains.attention.description", "Evaluation of sustained attention, selective attention, and information processing speed.")}</p>
                      <ul className="list-unstyled mb-0">
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.attention.test1", "Reaction Time Test")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.attention.test2", "Stroop Test")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.attention.test3", "Sustained Attention Task")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="domain-card card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="domain-icon fs-1 mb-3 text-center" aria-hidden="true">🎯</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultDomains.executive.name", "Executive Function")}</h3>
                      <p className="small mb-3">{t("aboutMaitri.defaultDomains.executive.description", "Assessment of planning, problem-solving, cognitive flexibility, and inhibitory control.")}</p>
                      <ul className="list-unstyled mb-0">
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.executive.test1", "N-Back Test")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.executive.test2", "Color Sequence Test")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.executive.test3", "Planning and Organization Tasks")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="domain-card card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <div className="domain-icon fs-1 mb-3 text-center" aria-hidden="true">👁️</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultDomains.visuospatial.name", "Visuospatial Abilities")}</h3>
                      <p className="small mb-3">{t("aboutMaitri.defaultDomains.visuospatial.description", "Evaluation of spatial perception, visual memory, and ability to manipulate visual information.")}</p>
                      <ul className="list-unstyled mb-0">
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.visuospatial.test1", "Symbol Match Test")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.visuospatial.test2", "Spatial Orientation Tasks")}</li>
                        <li className="small mb-1"><span className="badge bg-secondary me-2" aria-hidden="true">•</span>{t("aboutMaitri.defaultDomains.visuospatial.test3", "Visual Pattern Recognition")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      
      <section className="maitri-features card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="features-title">
        <div className="card-body p-4 p-md-5">
          <h2 id="features-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
            {t("aboutMaitri.featuresTitle", "Platform Features")}
          </h2>
          <div className="row g-4">
            {features ? (
              features.map((feature, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">{feature.icon || "🔬"}</div>
                      <h3 className="h5 fw-bold mb-3">{feature.title || "Feature"}</h3>
                      <p className="small mb-0">{feature.description || "Feature description"}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">🧠</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultFeatures.comprehensive.title", "Comprehensive Cognitive Assessment")}</h3>
                      <p className="small mb-0">{t("aboutMaitri.defaultFeatures.comprehensive.description", "Multiple validated tests covering memory, attention, executive function, and other cognitive domains to provide a complete picture of cognitive health.")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">📊</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultFeatures.analytics.title", "Data-Driven Analytics")}</h3>
                      <p className="small mb-0">{t("aboutMaitri.defaultFeatures.analytics.description", "Advanced analytics and visualization tools to track cognitive performance over time and identify patterns that may indicate early signs of decline.")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">🔔</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultFeatures.reminder.title", "Reminder System")}</h3>
                      <p className="small mb-0">{t("aboutMaitri.defaultFeatures.reminder.description", "Intelligent reminder system to help users maintain medication schedules, appointments, and daily activities, supporting independent living.")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">💬</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultFeatures.chatbot.title", "AI-Powered Chatbot")}</h3>
                      <p className="small mb-0">{t("aboutMaitri.defaultFeatures.chatbot.description", "Interactive chatbot providing information, answering questions, and offering support related to dementia, cognitive health, and caregiving.")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">📈</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultFeatures.tracking.title", "Progress Tracking")}</h3>
                      <p className="small mb-0">{t("aboutMaitri.defaultFeatures.tracking.description", "Detailed progress reports and trend analysis to monitor cognitive changes and share insights with healthcare professionals.")}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="feature-card card h-100 shadow-sm border-0">
                    <div className="card-body text-center">
                      <div className="feature-icon fs-1 mb-3" aria-hidden="true">🌐</div>
                      <h3 className="h5 fw-bold mb-3">{t("aboutMaitri.defaultFeatures.language.title", "Multi-Language Support")}</h3>
                      <p className="small mb-0">{t("aboutMaitri.defaultFeatures.language.description", "Available in multiple languages to ensure accessibility for diverse populations and communities worldwide.")}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


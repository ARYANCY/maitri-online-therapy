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

export default function WhatIsDementia() {
  const { t } = useTranslation();

  const getArray = useCallback((key) => {
    const value = t(key, [], { returnObjects: true });
    return Array.isArray(value) ? value : [];
  }, [t]);

  
  const dementiaPrevalenceData = useMemo(() => ({
    labels: ['65-69', '70-74', '75-79', '80-84', '85-89', '90+'],
    datasets: [{
      label: t("aboutMaitri.chartLabels.prevalence", "Prevalence (%)"),
      data: [2, 5, 10, 20, 30, 40],
      backgroundColor: [
        'rgba(111, 174, 154, 0.8)',
        'rgba(111, 174, 154, 0.85)',
        'rgba(111, 174, 154, 0.9)',
        'rgba(111, 174, 154, 0.95)',
        'rgba(111, 174, 154, 1)',
        'rgba(227, 154, 76, 0.9)'
      ],
      borderColor: [
        '#6FAE9A',
        '#6FAE9A',
        '#6FAE9A',
        '#6FAE9A',
        '#6FAE9A',
        '#E39A4C'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }), [t]);

  const dementiaTypesData = useMemo(() => ({
    labels: [
      t("aboutMaitri.chartLabels.alzheimers", "Alzheimer's"),
      t("aboutMaitri.chartLabels.vascular", "Vascular"),
      t("aboutMaitri.chartLabels.lewyBody", "Lewy Body"),
      t("aboutMaitri.chartLabels.frontotemporal", "Frontotemporal"),
      t("aboutMaitri.chartLabels.mixed", "Mixed"),
      t("aboutMaitri.chartLabels.other", "Other")
    ],
    datasets: [{
      data: [60, 20, 10, 5, 3, 2],
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
      hoverOffset: 8
    }]
  }), [t]);

  const globalStatsData = useMemo(() => ({
    labels: ['2020', '2025', '2030', '2035', '2040'],
    datasets: [{
      label: t("aboutMaitri.chartLabels.globalCases", "Global Cases (Millions)"),
      data: [55, 70, 85, 100, 115],
      borderColor: '#6FAE9A',
      backgroundColor: 'rgba(111, 174, 154, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.5,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#6FAE9A',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2
    }]
  }), [t]);

  const riskFactorsData = useMemo(() => ({
    labels: [
      t("aboutMaitri.chartLabels.age", "Age"),
      t("aboutMaitri.chartLabels.genetics", "Genetics"),
      t("aboutMaitri.chartLabels.lifestyle", "Lifestyle"),
      t("aboutMaitri.chartLabels.cardiovascular", "Cardiovascular"),
      t("aboutMaitri.chartLabels.education", "Education"),
      t("aboutMaitri.chartLabels.social", "Social")
    ],
    datasets: [{
      label: t("aboutMaitri.chartLabels.riskFactorImpact", "Risk Factor Impact (%)"),
      data: [35, 25, 20, 10, 5, 5],
      backgroundColor: [
        'rgba(227, 154, 76, 0.9)',
        'rgba(227, 154, 76, 0.8)',
        'rgba(227, 154, 76, 0.7)',
        'rgba(227, 154, 76, 0.6)',
        'rgba(227, 154, 76, 0.5)',
        'rgba(227, 154, 76, 0.5)'
      ],
      borderColor: '#D38A3C',
      borderWidth: 2,
      borderRadius: 6
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
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label || ''}: ${context.parsed.y || context.parsed}%`;
          }
        }
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

  
  const dementiaStatsList = useMemo(() => {
    const stats = getArray("aboutMaitri.dementiaStatsList");
    if (stats.length > 0) return stats;
    return [
      t("aboutMaitri.stats.over55Million", "Over 55 million people worldwide live with dementia"),
      t("aboutMaitri.stats.nearly10Million", "Nearly 10 million new cases every year"),
      t("aboutMaitri.stats.seventhCause", "Dementia is the 7th leading cause of death globally"),
      t("aboutMaitri.stats.costsExceed", "Costs exceed $1.3 trillion annually worldwide"),
      t("aboutMaitri.stats.by2050", "By 2050, cases expected to reach 152 million"),
      t("aboutMaitri.stats.twoThirds", "Two-thirds of cases occur in low- and middle-income countries")
    ];
  }, [getArray, t]);

  
  const dementiaTypes = useMemo(() => {
    const types = getArray("aboutMaitri.dementiaTypes");
    if (types.length > 0) return types;
    return null;
  }, [getArray]);

  return (
    <div className="what-is-dementia">
      
      <section className="dementia-overview card shadow-sm border-0 mb-4 mb-md-5" aria-labelledby="dementia-overview-title">
        <div className="card-body p-4 p-md-5">
          <h2 id="dementia-overview-title" className="display-5 fw-bold text-center mb-4 mb-md-5 pb-3 border-bottom">
            {t("aboutMaitri.dementiaOverviewTitle", "Understanding Dementia: A Scientific Overview")}
          </h2>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="dementia-definition">
                <h3 className="h3 fw-bold mb-3">{t("aboutMaitri.dementiaDefinitionTitle", "What is Dementia?")}</h3>
                <p className="fs-6 lh-lg mb-3">
                  {t("aboutMaitri.dementiaDefinitionParagraph1", "Dementia is a clinical syndrome characterized by progressive cognitive decline that interferes with daily functioning. It encompasses a range of neurodegenerative disorders, most commonly Alzheimer's disease (AD), vascular dementia, Lewy body dementia, and frontotemporal dementia. The condition affects memory, executive function, language, visuospatial abilities, and behavioral regulation.")}
                </p>
                <p className="fs-6 lh-lg mb-3">
                  {t("aboutMaitri.dementiaDefinitionParagraph2", "Dementia is not a single disease but rather a term that describes a group of symptoms affecting memory, thinking, and social abilities severely enough to interfere with daily life. While memory loss is a common symptom, dementia involves much more than just forgetfulness. It can affect a person's ability to communicate, reason, and perform everyday tasks.")}
                </p>
                <p className="fs-6 lh-lg mb-0">
                  {t("aboutMaitri.dementiaDefinitionParagraph3", "Early signs may include difficulty remembering recent events, problems with language, disorientation, mood changes, and loss of motivation. As the condition progresses, individuals may require increasing levels of care and support. Early detection through cognitive assessment tools like those provided by Maitri can help identify potential issues and enable timely intervention.")}
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="dementia-stats">
                <h3 className="h4 fw-bold mb-3">{t("aboutMaitri.dementiaStatsTitle", "Global Impact")}</h3>
                <ul className="list-unstyled mb-4">
                  {dementiaStatsList.map((stat, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                      <span className="text-success flex-shrink-0" aria-hidden="true">✓</span>
                      <span className="small">{stat}</span>
                    </li>
                  ))}
                </ul>
                
                
                <div className="chart-container mt-4" style={{ height: '300px' }} role="img" aria-label={t("aboutMaitri.chartTitles.globalCases", "Projected Global Dementia Cases (Millions)")}>
                  <h4 className="h6 fw-semibold mb-3">
                    {t("aboutMaitri.chartTitles.globalCases", "Projected Global Dementia Cases (Millions)")}
                  </h4>
                  <Line data={globalStatsData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          
          <div className="dementia-types mt-5">
            <h3 className="h3 fw-bold mb-4">{t("aboutMaitri.dementiaTypesTitle", "Major Types of Dementia")}</h3>
            
            
            <div className="row mb-4">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="chart-container" style={{ height: '350px' }} role="img" aria-label={t("aboutMaitri.chartTitles.typesDistribution", "Distribution of Dementia Types")}>
                  <h4 className="h6 fw-semibold mb-3">
                    {t("aboutMaitri.chartTitles.typesDistribution", "Distribution of Dementia Types")}
                  </h4>
                  <Doughnut data={dementiaTypesData} options={pieChartOptions} />
                </div>
              </div>
            </div>

            <div className="row g-4">
              {dementiaTypes ? (
                dementiaTypes.map((type, idx) => (
                  <div key={idx} className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{type.name}</h4>
                        <p className="small mb-3">{type.description}</p>
                        <span className="badge bg-primary">{type.prevalence}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.dementiaTypeCards.alzheimers.title", "Alzheimer's Disease (AD)")}</h4>
                        <p className="small mb-3">{t("aboutMaitri.dementiaTypeCards.alzheimers.description", "Most common form, accounting for 60-70% of cases. Characterized by amyloid plaques and neurofibrillary tangles, leading to progressive memory loss and cognitive decline.")}</p>
                        <span className="badge bg-primary">{t("aboutMaitri.dementiaTypeCards.alzheimers.prevalence", "60-70% of cases")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.dementiaTypeCards.vascular.title", "Vascular Dementia")}</h4>
                        <p className="small mb-3">{t("aboutMaitri.dementiaTypeCards.vascular.description", "Second most common type, caused by reduced blood flow to the brain. Often results from strokes or other vascular conditions affecting brain function.")}</p>
                        <span className="badge bg-primary">{t("aboutMaitri.dementiaTypeCards.vascular.prevalence", "20% of cases")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.dementiaTypeCards.lewyBody.title", "Lewy Body Dementia")}</h4>
                        <p className="small mb-3">{t("aboutMaitri.dementiaTypeCards.lewyBody.description", "Characterized by abnormal protein deposits (Lewy bodies) in the brain. Symptoms include visual hallucinations, movement problems, and cognitive fluctuations.")}</p>
                        <span className="badge bg-primary">{t("aboutMaitri.dementiaTypeCards.lewyBody.prevalence", "10% of cases")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.dementiaTypeCards.frontotemporal.title", "Frontotemporal Dementia")}</h4>
                        <p className="small mb-3">{t("aboutMaitri.dementiaTypeCards.frontotemporal.description", "Affects the frontal and temporal lobes, leading to changes in personality, behavior, and language. Often occurs at a younger age (40-65 years).")}</p>
                        <span className="badge bg-primary">{t("aboutMaitri.dementiaTypeCards.frontotemporal.prevalence", "5% of cases")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.dementiaTypeCards.mixed.title", "Mixed Dementia")}</h4>
                        <p className="small mb-3">{t("aboutMaitri.dementiaTypeCards.mixed.description", "Combination of two or more types, most commonly Alzheimer's and vascular dementia. More common in older adults (85+ years).")}</p>
                        <span className="badge bg-primary">{t("aboutMaitri.dementiaTypeCards.mixed.prevalence", "3% of cases")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="type-card card h-100 shadow-sm border-0">
                      <div className="card-body">
                        <h4 className="h5 fw-bold mb-3">{t("aboutMaitri.dementiaTypeCards.other.title", "Other Types")}</h4>
                        <p className="small mb-3">{t("aboutMaitri.dementiaTypeCards.other.description", "Includes dementia due to Parkinson's disease, Huntington's disease, Creutzfeldt-Jakob disease, and other less common causes.")}</p>
                        <span className="badge bg-primary">{t("aboutMaitri.dementiaTypeCards.other.prevalence", "2% of cases")}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body p-4">
              <h3 className="h4 fw-bold mb-4">
                {t("aboutMaitri.chartTitles.agePrevalence", "Dementia Prevalence by Age Group")}
              </h3>
              <div className="chart-container mb-3" style={{ height: '300px' }} role="img" aria-label={t("aboutMaitri.chartTitles.agePrevalence", "Dementia Prevalence by Age Group")}>
                <Bar data={dementiaPrevalenceData} options={chartOptions} />
              </div>
              <p className="small mb-0">
                {t("aboutMaitri.chartDescriptions.agePrevalence", "Dementia prevalence increases significantly with age. While only 2% of people aged 65-69 are affected, this rises to 40% or more for those over 90 years old. Early detection and intervention are crucial for managing the condition effectively.")}
              </p>
            </div>
          </div>

          
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body p-4">
              <h3 className="h4 fw-bold mb-4">
                {t("aboutMaitri.chartTitles.riskFactors", "Key Risk Factors for Dementia")}
              </h3>
              <div className="chart-container mb-3" style={{ height: '300px' }} role="img" aria-label={t("aboutMaitri.chartTitles.riskFactors", "Key Risk Factors for Dementia")}>
                <Bar data={riskFactorsData} options={{...chartOptions, indexAxis: 'y'}} />
              </div>
              <p className="small mb-0">
                {t("aboutMaitri.chartDescriptions.riskFactors", "Understanding risk factors helps in prevention and early intervention. While age and genetics are non-modifiable, lifestyle factors such as physical activity, diet, and social engagement can significantly reduce dementia risk.")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


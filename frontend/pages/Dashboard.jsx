return (
  <div className="dashboard-page">
    <Navbar user={user} />
    <div className="dashboard-container" ref={reportRef}>
      <div className="dashboard-header">
        <div className="d-flex gap-2">
          <button
            className="dashboard-download-btn download-btn"
            onClick={() => setShowFormatPopup(true)}
            disabled={downloading}
          >
            {downloading
              ? t("dashboard.downloading", "Generating Report...")
              : t("dashboard.downloadReport", "Download Report")}
          </button>

          {showFormatPopup && (
            <div
              className="report-popup-overlay"
              onClick={() => setShowFormatPopup(false)}
            >
              <div
                className="report-popup"
                onClick={(e) => e.stopPropagation()} // prevent overlay click from closing modal
              >
                <h6>Select Report Format</h6>

                <div className="report-options">
                  {[
                    {
                      fmt: "pdf",
                      desc:
                        "Generates a printable and shareable report file that includes all metrics, user details, and visual charts.",
                    },
                    {
                      fmt: "csv",
                      desc:
                        "Exports your data in spreadsheet format for use in Excel or Google Sheets for further analysis.",
                    },
                    {
                      fmt: "json",
                      desc:
                        "Provides a structured data file suitable for developers or API integration.",
                    },
                  ].map(({ fmt, desc }) => (
                    <button
                      key={fmt}
                      className="report-option-btn"
                      onClick={() => {
                        handleDownloadReport(fmt);
                        setShowFormatPopup(false);
                      }}
                    >
                      {fmt.toUpperCase()}
                      <span className="info-tooltip" title={desc}>
                        ℹ
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  className="report-popup-close"
                  onClick={() => setShowFormatPopup(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ul className="dashboard-tabs">
        {["chatbot", "chart", "todo"].map((tab) => (
          <li key={tab} className="dashboard-tab-item">
            <button
              className={`dashboard-tab-btn ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {t(
                `dashboard.tab.${tab}`,
                tab.charAt(0).toUpperCase() + tab.slice(1)
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="dashboard-content">{renderContent()}</div>
    </div>
  </div>
);

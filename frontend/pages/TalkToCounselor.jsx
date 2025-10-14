import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import "../css/TalkToCounselor.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TalkToCounselor() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState({ user: true, list: true });
  const [error, setError] = useState({ user: "", list: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  // Debounce searchTerm
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await API.auth.checkSession();
      if (!res?.success || !res?.user) {
        navigate("/login");
        return;
      }
      setUser(res.user);
      setError((prev) => ({ ...prev, user: "" }));
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/login");
    } finally {
      setLoading((prev) => ({ ...prev, user: false }));
    }
  }, [navigate]);
  const fetchCounselors = useCallback(async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    setError((prev) => ({ ...prev, list: "" }));

    try {
      const res = await API.therapist.getAccepted();
      if (!res?.success) throw new Error(res?.message || "Failed to fetch");

      const therapists = Array.isArray(res.therapists) ? res.therapists : [];
      setCounselors(therapists);
    } catch (err) {
      console.error("Counselor fetch error:", err);
      setError((prev) => ({
        ...prev,
        list: err.message || t("talk.errorFetching", "Error fetching counselors"),
      }));
      setCounselors([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  }, [t]);


  useEffect(() => {
    (async () => {
      await fetchUser();
      await fetchCounselors();
    })();
  }, [fetchUser, fetchCounselors]);

  const specializations = useMemo(() => {
    const allSpecs = counselors
      .map((c) => c.specialization)
      .filter((s) => s && s.trim() !== "");
    return [...new Set(allSpecs)];
  }, [counselors]);

  const filteredCounselors = useMemo(() => {
    return counselors.filter((c) => {
      const matchesSearch =
        !debouncedSearch ||
        c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.specialization
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());
      const matchesSpec =
        !filterSpecialization ||
        c.specialization === filterSpecialization;
      return matchesSearch && matchesSpec;
    });
  }, [counselors, debouncedSearch, filterSpecialization]);

  const handleRefresh = () => fetchCounselors();

  const safe = (v) =>
    v && v.trim() !== ""
      ? v
      : t("talk.notProvided", "N/A");

  return (
    <div className="talk-page light-version">
      <Navbar user={user} />
      <main className="talk-content container py-5">
        <header className="talk-header text-center mb-5">
          <h1 className="talk-title fw-bold text-primary">
            {t("talk.title", "Talk to a Counselor")}
          </h1>
          <p className="talk-subtitle lead text-muted">
            {t(
              "talk.subtitle",
              "Our verified counselors are ready to assist you professionally."
            )}
          </p>
        </header>

        {error.list && (
          <div className="alert alert-danger text-center talk-error">
            {error.list}
            <button
              type="button"
              className="btn-close float-end"
              onClick={() =>
                setError((prev) => ({ ...prev, list: "" }))
              }
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="counselor-filters mb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t(
                    "talk.searchPlaceholder",
                    "Search by name or specialization..."
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterSpecialization}
                onChange={(e) =>
                  setFilterSpecialization(e.target.value)
                }
              >
                <option value="">
                  {t(
                    "talk.allSpecializations",
                    "All Specializations"
                  )}
                </option>
                {specializations.map((spec, i) => (
                  <option key={i} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={handleRefresh}
                disabled={loading.list}
              >
                {loading.list ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <i className="bi bi-arrow-clockwise"></i>
                )}
                {" "}
                {t("talk.refresh", "Refresh")}
              </button>
            </div>
          </div>
        </div>

        {loading.list ? (
          <div className="text-center my-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                {t("talk.loading", "Loading counselors...")}
              </span>
            </div>
            <p className="mt-2">
              {t("talk.loading", "Loading counselors...")}
            </p>
          </div>
        ) : filteredCounselors.length === 0 ? (
          <div className="talk-empty text-center my-5">
            <i className="bi bi-search fs-1 text-muted"></i>
            <p className="mt-3 text-muted">
              {searchTerm || filterSpecialization
                ? t(
                    "talk.noMatchingCounselors",
                    "No counselors match your search criteria."
                  )
                : t(
                    "talk.noCounselors",
                    "No counselors available right now."
                  )}
            </p>
            {(searchTerm || filterSpecialization) && (
              <button
                className="btn btn-outline-secondary mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setFilterSpecialization("");
                }}
              >
                {t("talk.clearFilters", "Clear Filters")}
              </button>
            )}
          </div>
        ) : (
          <section className="counselor-grid">
            {filteredCounselors.map((c) => (
              <article key={c._id} className="counselor-card glass-hover">
                <div className="counselor-card-body">
                  <h5 className="counselor-name card-title">
                    {safe(c.name)}
                  </h5>
                  <p>
                    <strong>{t("talk.email", "Email")}:</strong>{" "}
                    {safe(c.email)}
                  </p>
                  <p>
                    <strong>
                      {t("talk.specialization", "Specialization")}:
                    </strong>{" "}
                    {safe(c.specialization)}
                  </p>
                  
                  <p>
                    <strong>
                      {t("talk.experience", "Experience")}:
                    </strong>{" "}
                    {c.experience || 0} {t("talk.years", "yrs")}
                  </p>
                  {c.qualifications && (
                    <p>
                      <strong>
                        {t("talk.qualifications", "Qualifications")}:
                      </strong>{" "}
                      {c.qualifications}
                    </p>
                  )}
                  {c.availability && (
                    <p>
                      <strong>
                        {t("talk.availability", "Availability")}:
                      </strong>{" "}
                      {c.availability}
                    </p>
                  )}
                  {c.bio && (
                    <p>
                      <strong>{t("talk.bio", "Bio")}:</strong>{" "}
                      {c.bio}
                    </p>
                  )}
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="btn-call"
                    >
                      <i className="bi bi-telephone-fill me-2"></i>
                      {t("talk.callNow", "Call Now")}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="footer-section">
        <div className="footer-overlay">
          <div className="footer-content container text-center">
            <h2 className="footer-title">Maitri</h2>
            <p className="footer-subtitle">
              {t(
                "talk.footerLine",
                "Your safe space for mindful conversations and healing connections."
              )}
            </p>
            <div className="footer-links">
              <Link
                to="/therapist-form"
                className="footer-link"
              >
                {t("talk.therapistForm", "Therapist Form")}
              </Link>
              <Link to="/admin" className="footer-link">
                {t("talk.adminDashboard", "Admin Dashboard")}
              </Link>
            </div>
            <p className="footer-copy">
              © 2025 Maitri —{" "}
              {t("talk.footer", "Empowering mental wellness")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
